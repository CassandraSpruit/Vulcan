const TemplateManager = require('./template-manager');
const create = require('./create');
const deleteTemplate = require('./delete');
const generate = require('./generate');
const updateTemplate = require('./update-template');
const update = require('./update');
const register = require('./register');
const linkTemplate = require('./link');
const {list, view} = require('./list');

async function vulcan(cli) {
	const command = cli.input[0];
	const templateName = cli.input[1];
	const flags = cli.flags;
	const tmplMan = new TemplateManager();

	switch (command) {
		case 'generate':
			if (!templateName) {
				return cli.showHelp();
			}

			return generate(tmplMan, templateName, flags);
		case 'register':
			return register(tmplMan);
		case 'create':
			if (!templateName) {
				return cli.showHelp();
			}

			await register(tmplMan, templateName);
			return create(templateName);
		case 'delete':
			return deleteTemplate(tmplMan, templateName);
		case 'clear':
			return tmplMan.clear();
		case 'link':
			return linkTemplate(tmplMan, cli.pkg, templateName);
		case 'list':
			return list(tmplMan);
		case 'view':
			if (!templateName) {
				return list(tmplMan);
			}

			return view(tmplMan, templateName);
		case 'update':
			if (templateName) {
				return updateTemplate(tmplMan, templateName);
			}

			return update();
		default:
			return cli.showHelp();
	}
}

module.exports = vulcan;
