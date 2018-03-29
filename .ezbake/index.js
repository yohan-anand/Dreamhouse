const appirio = {
  gitLabUrl: 'https://gitlab.appirio.com',
  sonarQubeUrl: "https://sonar.appirio.com"
};

module.exports = {
  source: {
    "**/config/*": true,
    "**/.gitlab-ci.yml": true,
    "**/sfdx-project.json": false
  },
  ingredients: [{
      "type": "confirm",
      "name": "usesCMC",
      "message": "Will your project use CMC?",
      "default": true,
      "filter": response => {
        return response ? 1 : 0;
      }
    },
    {
      "type": "input",
      "name": "CMCProduct",
      "message": "What is the exact name of your 'Product' in CMC?",
      default: "None",
      validate: response => response !== "",
      when: function (answers) {
        return answers.usesCMC != false;
      }
    },
    {
      "type": "list",
      "name": "continuousIntegrationType",
      "message": "Which CI System would you like to use?",
      "choices": ["GitLab CI", "Bitbucket Pipelines"],
      "default": "GitLab CI",
      filter: response => {
        return {
          'GitLab CI': 'gitlab',
          'Bitbucket Pipelines': 'bitbucket_pipelines'
        }[response];
      }
    },
    {
      "type": "input",
      "name": "continuousIntegrationURL",
      "message": "What is the URL of your CI system?",
      default: answers => {
        return {
          'gitlab': appirio.gitLabUrl,
          'bitbucket_pipelines': 'https://bitbucket.org'
        }[answers.continuousIntegrationType]
      }
    },
    {
      "type": "input",
      "name": "gitlab__personal_token",
      "message": "You specified a GitLab CI server other than Appirio's standard CI server. What is the personal access token for this server?",
      when: answers => {
        // TODO - this token should be written to the .env file
        answers.gitlab__personal_token = answers.gitlab__personal_token || ''
        return (answers.continuousIntegrationType === 'gitlab') && (answers.continuousIntegrationURL !== appirio.gitLabUrl);
      }
    },
    {
      "type": "list",
      "name": "enableSonarQube",
      "message": "Enable quality scanning using SonarQube?",
      "choices": ["Yes", "No"],
      filter: val => (val === "Yes")
    },
    {
      "type": "input",
      "name": "sonarUrl",
      "message": "What's the URL of your SonarQube instance?",
      "default": appirio.sonarQubeUrl,
      when: answers => answers.enableSonarQube
    },
    {
      "type": "list",
      "name": "cleanUpBranches",
      "message": "Automatically clean up branches that have been merged?",
      choices: ["Yes", "No"],
      default: "Yes",
      filter: val => (val === "Yes")
    },
    {
      "type": "list",
      "name": "devHub",
      "message": "Do you want to authorize a new dev hub or use the global default?",
      choices: ["Authorize a new dev-hub", "Use global default dev-hub"],
      default: "Authorize a new dev-hub",
    },
    {
      "type": "confirm",
      "name": "sfdxInit",
      "message": "Do you want us to initialize a new SalesforceDX project for you?",
      "default": true,
    }
  ],
  icing: [{
      description: 'Storing GitLab personal token (if applicable)',
      cmd: [`<% if(gitlab__personal_token) { return 'adx' } else { return 'echo' } %>`,
        `<% if(gitlab__personal_token) { return 'env:add' } else { return 'Not' } %>`,
        `<% if(gitlab__personal_token) { return '-k' } else { return 'Required' } %>`,
        `<% if(gitlab__personal_token) { return 'gitlab__personal_token' } else { return } %>`,
        `<% if(gitlab__personal_token) { return '-b' } else { return } %>`,
        `<% if(gitlab__personal_token) {%><%= gitlab__personal_token %><%} else { return } %>`
      ]
    },
    {
      description: 'Creating SonarQube configuration files (if required)',
      cmd: [`<% if(enableSonarQube) { return 'adx' } else { return 'echo' } %>`,
        `<% if(enableSonarQube) { return 'sonar:config' } else { return 'Not Required' } %>`
      ]
    },
    {
      description: 'Authorizing your dev hub (if requested)',
      cmd: [`<% if(devHub === "Authorize a new dev-hub") { return 'sfdx' } else { return 'echo' } %>`,
        `<% if(devHub === "Authorize a new dev-hub") { return 'force:auth:web:login' } else { return 'Not Required' } %>`,
        `<% if(devHub === "Authorize a new dev-hub") { return '--setdefaultdevhubusername' } else { return } %>`
      ]
    }
  ]
}