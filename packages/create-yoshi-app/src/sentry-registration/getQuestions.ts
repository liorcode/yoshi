import { ExtendedPromptObject } from '../extended-prompts';
import { addSentry } from './addSentry';

export default (): Array<ExtendedPromptObject<string>> => {
  return [
    {
      type: 'text',
      name: 'teamName',
      message: "Sentry Team Name (Will be created if doesn't exist already)",
      format: (val) => val.replace(/\s+/g, '-').toLowerCase(),
      async after(answers, context: any) {
        const sentryApp = await addSentry({
          teamName: answers.teamName,
          projectName: context.projectName,
        });
        answers.DSN = sentryApp.public;
        answers.id = sentryApp.id;
        answers.projectName = sentryApp.projectName;
        return answers;
      },
      validate(value: string) {
        return !!value;
      },
    },
  ];
};
