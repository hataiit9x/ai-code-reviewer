import {Command} from 'commander';
import {GitLab} from './gitlab';
import {OpenAI} from './openai';
import {Gemini} from './gemini'; // import the Gemini class
import {delay, getDiffBlocks, getLineObj} from "./utils";

const program = new Command();

program
    .option('-g, --gitlab-api-url <string>', 'GitLab API URL', ' https://gitlab.com/api/v4')
    .option('-t, --gitlab-access-token <string>', 'GitLab Access Token')
    .option('-o, --openai-api-url <string>', 'OpenAI API URL', 'https://api.openai.com/v1')
    .option('-a, --openai-access-token <string>', 'OpenAI Access Token')
    .option('-p, --project-id <number>', 'GitLab Project ID')
    .option('-m, --merge-request-id <string>', 'GitLab Merge Request ID')
    .option('-org, --organization-id <number>', 'organization ID')
    .option('-c, --custom-model <string>', 'Custom Model ID', 'gpt-3.5-turbo')
    .option('-mode, --mode <string>', 'Mode use OpenAI or Gemini', 'openai') // add mode option
    .parse(process.argv);

async function run() {
    const {
        gitlabApiUrl,
        gitlabAccessToken,
        openaiApiUrl,
        openaiAccessToken,
        projectId,
        mergeRequestId,
        organizationId,
        customModel,
        mode // get the mode option
    } = program.opts();
    console.log('ai code review is underway...')
    const gitlab = new GitLab({gitlabApiUrl, gitlabAccessToken, projectId, mergeRequestId});
    const openai = new OpenAI(openaiApiUrl, openaiAccessToken, organizationId, customModel);
    const gemini = new Gemini(openaiApiUrl, openaiAccessToken, customModel); // create a new instance of the Gemini class
    await gitlab.init().catch(() => {
        console.log('gitlab init error')
    });
    const changes = await gitlab.getMergeRequestChanges().catch(() => {
        console.log('get merge request changes error')
    });
    for (const change of changes) {
        if (change.renamed_file || change.deleted_file || !change?.diff?.startsWith('@@')) {
            continue;
        }
        const diffBlocks = getDiffBlocks(change?.diff);
        while (!!diffBlocks.length) {
            const item = diffBlocks.shift()!;
            const lineRegex = /@@\s-(\d+)(?:,(\d+))?\s\+(\d+)(?:,(\d+))?\s@@/;
            const matches = lineRegex.exec(item);
            if (matches) {
                const lineObj = getLineObj(matches, item);
                if ((lineObj?.new_line && lineObj?.new_line > 0) || (lineObj.old_line && lineObj.old_line > 0)) {
                    try {
                        console.log('use mode...',mode)
                        if (mode === 'gemini') { // check the mode
                            console.log('use gemini')
                            const suggestion = await gemini.reviewCodeChange(item);
                            console.log('suggestion gemini:', suggestion)
                            if (!suggestion.includes('666')) {
                                await gitlab.addReviewComment(lineObj, change, suggestion);
                            }
                        } else { // use the OpenAI API by default
                            console.log('use openai')
                            const suggestion = await openai.reviewCodeChange(item);
                            console.log('suggestion openai:', suggestion)
                            if (!suggestion.includes('666')) {
                                await gitlab.addReviewComment(lineObj, change, suggestion);
                            }
                        }
                    } catch (e: any) {
                        if (e?.response?.status === 429) {
                            console.log('Too Many Requests, try again');
                            await delay(60 * 1000);
                            diffBlocks.push(item);
                        }
                    }
                }
            }
        }
    }
    console.log('done');
}

module.exports = run;

