# aws-ssm-parameters-actions

> Parse AWS Systems Manager parameters to environment variables.

## Content

  * [About](#about)
     * [Authentication](#authentication)
     * [Parameters](#parameters)
     * [Examples](#examples)
        * [Get Parameters](#get-parameters)
        * [Get parameters recursive](#get-parameters-recursive)
        * [Get multiples paths](#get-multiples-paths)
  * [TODO](#todo)

## About

Get information from [AWS SSM parameters](https://console.aws.amazon.com/systems-manager/parameters) and exports them to environmental variables.

<a  name="authentication"/>

#### Authentication

```yaml
name: Parse SSM parameter

on:
  push

jobs:
  get-ssm-env:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-region: us-east-1
          aws-access-key-id:  ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Parameters

Parameter name | Type | Required | Default Value | Description
--- | --- | --- | --- | ---
`paths` | string | true | | AWS Systems Manager parameter name (path) or path prefix to get recursive params from path separeted by new lines
`recursive` | boolean | false | false| Get all envs from the path
`with-decryption` | boolean | false | false | Get encrypted secrets values without decryption
`split-env` | boolean | false | true | Get encrypted secrets values without decryption Ex: /path/to/param/env_name => env_name
`upper-case` | boolean | false | false | Upper case secret keys Ex: /path/to/param/env_name => /PATH/TO/PARAM/ENV_NAME
`env-prefix` | string | false | '' | Get encrypted secrets values without decryption

### Examples

<a  name="get-parameters"/>

#### Get parameters

```yaml
name: Parse SSM parameter

on:
  push

jobs:
  get-ssm-env:
    runs-on: ubuntu-latest
    steps:
      - name: aws-ssm-to-env
        uses: eliasjcjunior/aws-ssm-parameters-actions@main
        with:
          paths: |
          /path/to/ssm/secret_name

      - name: log envs
        env:
          secret_name: ${{ env.secret_name }}
        run: |
          echo $secret_name
```

<a  name="get-parameters-recursive"/>

#### Get parameters recursive

Using a example with the paths /path/to/ssm/secret_1 and /path/to/ssm/secret_2


```yaml
name: Parse SSM parameter

on:
  push

jobs:
  get-ssm-env:
    runs-on: ubuntu-latest
    steps:
      - name: aws-ssm-to-env
        uses: eliasjcjunior/aws-ssm-parameters-actions@main
        with:
          recursive: true
          split-env: true
          upper-case: true
          paths: |
          /path/to/ssm
          
      - name: log envs
        env:
          SECRET_1: ${{ env.SECRET_1 }}
          SECRET_2: ${{ env.SECRET_2 }}
        run: |
          echo $SECRET_1
          echo $SECRET_2
```

<a  name="get-multiple-paths"/>

#### Get multiple paths

```yaml
name: Parse SSM parameter

on:
  push

jobs:
  get-ssm-env:
    runs-on: ubuntu-latest
    steps:
      - name: aws-ssm-to-env
        uses: eliasjcjunior/aws-ssm-parameters-actions@main
        with:
          split-env: true
          upper-case: true
          paths: |
          /path/to/ssm/name_secret
          /example/path/to/secret_example
          
      - name: log envs
        env:
          SECRET_1: ${{ env.NAME_SECRET }}
          SECRET_2: ${{ env.SECRET_EXAMPLE }}
        run: |
          echo $NAME_SECRET
          echo $SECRET_EXAMPLE
```

## TODO
 - [ ] Create new export forms (Ex: .env, json)