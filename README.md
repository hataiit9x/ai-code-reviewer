# @hataiit9x/ai-code-reviewer

## Summary

![](preview.png)

`@hataiit9x/ai-code-reviewer` It is a small tool used for code review in GitLab Merge Requests. It supports calling the GitLab API for private deployment and uses the OpenAI API to obtain review results. Please note that when using it, ensure compliance with company regulations. 😉


## Features

- 🛠️ Support configuration GitLab API address
- 🌍 Support configuration OpenAI proxy API address to solve the problem that the OpenAI API may not be accessible in China
- 🆔 Support configuration OpenAI organization ID
- ⚙️ Support configuration OpenAI API Key to implement load balancing of interface calls (multiple Keys are separated by commas)
- 🚦 Automatically wait and try again when the rate limit is exceeded
- 💬 The review results are appended to the location of the corresponding code block in the form of comments


## Install

```sh
npm i @hataiit9x/ai-code-reviewer
`````

## Use

### Use via shell script

```shell
Usage: ai-code-reviewer [options]

Options:
  -g, --gitlab-api-url <string>       GitLab API URL (default: " https://gitlab.com/api/v4")
  -t, --gitlab-access-token <string>  GitLab Access Token
  -o, --openai-api-url <string>       OpenAI API URL (default: "https://api.openai.com")
  -a, --openai-access-token <string>  OpenAI Access Token
  -p, --project-id <number>           GitLab Project ID
  -m, --merge-request-id <string>     GitLab Merge Request ID
  -org, --organization-id <number>    organization ID
  -h, --help                          display help for command
```

Example:

```sh
ai-code-reviewer -g https://gitlab.com/api/v4 -t glpat-xxxxxxx -o https://api.openai.com -a skxxxxxxx,skxxxxxxx -p 432288 -m 8
```

### Use in CI

Set the `GITLAB_TOKEN` and `CHATGPT_KEY` variables in GitLab CI/CD, `.gitlab-ci.yml` is as follows:

```yml
stages:
  - merge-request

Code Review:
  stage: merge-request  
  image: node:16
  script:
    - npm i @hataiit9x/ai-code-reviewer -g
    - ai-code-reviewer -t "$GITLAB_TOKEN" -a "$CHATGPT_KEY"  -p "$CI_MERGE_REQUEST_PROJECT_ID" -m "$CI_MERGE_REQUEST_IID"
  only:
    - merge_requests
  when: on_success
```

## contribute
Welcome to contribute code, ask questions and suggestions! 👏

## License
This project is based on the MIT license. See the LICENSE file for details. 📜