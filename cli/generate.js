const inquirer = require('inquirer');
const {getPackageJSON, copyTemplateFiles} = require('./files');

async function generate(tmplMan, templateName) {
	const template = tmplMan.getTemplate(templateName);
	if (!template) {
		console.log('Error generating template: No template found with name', templateName);
		return;
	}

	const pkg = await getPackageJSON();
	if (pkg) {
		console.log('Error generating template: package.json already exists. Use "link" command instead.');
		return;
	}

	// Fill in the blanks set by the template
	const templatePkg = await getPackageJSON(template.location);
	const data = templatePkg.vulcan.fields;

	const answers = await askQuestions(data) || {};
	console.log('answers', answers);

	// Copy Files over
	// await copyTemplateFiles(template.location);
	console.log('Files successfully transfered. Happy coding!');
}

async function askQuestions(data) {
	if (!data) {
		return;
	}

	const questions = Object.entries(data).map(entry => {
		const key = entry[0];
		const properties = entry[1];
		const question = {
			name: key,
			message: properties.description || properties
		};

		if (properties.type) {
			switch (properties.type) {
				case 'number':
					question.type = 'number';
					break;
				case 'list':
					question.type = 'list';
					question.choices = properties.choices;
					break;
				case 'boolean':
					question.type = 'list';
					question.choices = ['true', 'false'];
					break;
				case 'string':
					question.type = 'input';
					break;
				default:
					question.type = 'input';
			}
		}

		let conditionFn = () => true;
		if (properties.pattern) {
			const pattern = new RegExp(properties.pattern);
			conditionFn = value => {
				const match = value.match(pattern);
				if (!match) {
					const message = properties.patternDescription || 'Field does not match pattern.';
					console.log('\n' + message);
					return false;
				}

				return true;
			};
		}

		if (properties.required) {
			const previous = conditionFn;
			conditionFn = value => {
				if (!value) {
					console.log('\nField is required.');
					return false;
				}

				return previous(value);
			};
		}

		if (conditionFn) {
			question.validate = conditionFn;
		}

		return question;
	});

	// Ask user questions
	const answers = await inquirer.prompt(questions);
	return answers;
}

module.exports = generate;
