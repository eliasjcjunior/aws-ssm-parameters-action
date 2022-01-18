const core = require('@actions/core');
const github = require('@actions/github');

try {
  const paths = core.getInput('paths');
  console.log(`Hello ${paths}!`);
} catch (error) {
  core.setFailed(error.message);
}