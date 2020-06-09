import commonEditorScriptEntry from '../CommonEditorScriptEntry';

describe('CommonEditorScriptEntry template', () => {
  it('generates correct template with entry editorScript file for OOI components', () => {
    const generateEditorScriptEntryContent = commonEditorScriptEntry({
      editorEntryFileName: 'project/src/editor.app.ts',
      artifactId: 'some-app',
      experimentsConfig: {
        scope: 'test-scope',
      },
      editorScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/editorScript.js',
      sentry: null,
      controllersMeta: [],
      shouldUseAppBuilder: false,
    });

    expect(generateEditorScriptEntryContent).toMatchSnapshot();
  });

  it('generates correct template with entry editorScript file for OOI components using sentry', () => {
    const generateEditorScriptEntryContent = commonEditorScriptEntry({
      editorEntryFileName: 'project/src/editor.app.ts',
      experimentsConfig: null,
      sentry: {
        DSN: 'kkk',
        id: '1',
        teamName: 'some-team',
        projectName: 'some-project',
      },
      artifactId: 'some-app',
      editorScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/editorScript.js',
      controllersMeta: [],
      shouldUseAppBuilder: false,
    });

    expect(generateEditorScriptEntryContent).toMatchSnapshot();
  });

  it('generates correct template without entry editorScript file for OOI components', () => {
    const generateEditorScriptEntryContent = commonEditorScriptEntry({
      editorEntryFileName: null,
      experimentsConfig: null,
      sentry: null,
      artifactId: 'some-app',
      editorScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/editorScript.js',
      controllersMeta: [],
      shouldUseAppBuilder: false,
    });

    expect(generateEditorScriptEntryContent).toMatchSnapshot();
  });

  it('generates correct template with entry editorScript file for app builder components', () => {
    const generateEditorScriptEntryContent = commonEditorScriptEntry({
      editorEntryFileName: 'project/src/editor.app.ts',
      artifactId: 'some-app',
      experimentsConfig: {
        scope: 'test-scope',
      },
      editorScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/editorScript.js',
      sentry: null,
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/a/editor.controller.ts',
          id: 'FIRST_ID',
          widgetType: 'STUDIO_WIDGET',
          controllerId: 'CONTROLLER_ID',
          componentName: 'SomeWidget',
        },
      ],
      shouldUseAppBuilder: true,
    });

    expect(generateEditorScriptEntryContent).toMatchSnapshot();
  });

  it('generates correct template with entry editorScript file for multiple app builder components', () => {
    const generateEditorScriptEntryContent = commonEditorScriptEntry({
      editorEntryFileName: 'project/src/editor.app.ts',
      artifactId: 'some-app',
      experimentsConfig: {
        scope: 'test-scope',
      },
      editorScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/editorScript.js',
      sentry: null,
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/a/editor.controller.ts',
          id: 'FIRST_ID',
          widgetType: 'STUDIO_WIDGET',
          controllerId: 'CONTROLLER_ID',
          componentName: 'SomeWidget',
        },
        {
          controllerFileName: 'project/src/components/c/editor.controller.ts',
          id: 'SECOND_ID',
          widgetType: 'STUDIO_WIDGET',
          controllerId: 'CONTROLLER_ID',
          componentName: 'SomeWidget',
        },
        {
          controllerFileName: 'project/src/components/d/editor.controller.ts',
          id: 'THIRD_ID',
          widgetType: 'STUDIO_WIDGET',
          controllerId: 'CONTROLLER_ID',
          componentName: 'SomeWidget',
        },
      ],
      shouldUseAppBuilder: true,
    });

    expect(generateEditorScriptEntryContent).toMatchSnapshot();
  });
});
