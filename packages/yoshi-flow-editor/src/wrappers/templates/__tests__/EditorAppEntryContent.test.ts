import editorAppEntryContent from '../EditorAppEntryContent';

describe('EditorAppEntry template', () => {
  it('generates correct template for editor app entry', () => {
    const generatedEditorAppEntryContent = editorAppEntryContent({
      editorAppWrapperPath: 'some/editor-app-wrapper',
      componentName: 'MyWidget',
      componentFileName: 'some/components/MyWidget.tsx',
      controllerFileName: 'some/components/controller.ts',
      viewerEntryFileName: 'some/viwer.app.ts',
      sentryConfig: {
        DSN: 'https//dsn.com',
        id: '123',
        projectName: 'some-project',
        teamName: 'some-team',
      },
      experimentsConfig: null,
    });

    expect(generatedEditorAppEntryContent).toMatchSnapshot();
  });

  it('generates correct template for editor app entry without viewerEntryFileName', () => {
    const generatedEditorAppEntryContent = editorAppEntryContent({
      editorAppWrapperPath: 'some/editor-app-wrapper',
      componentName: 'MyWidget',
      componentFileName: 'some/components/MyWidget.tsx',
      controllerFileName: 'some/components/controller.ts',
      viewerEntryFileName: null,
      sentryConfig: null,
      experimentsConfig: null,
    });

    expect(generatedEditorAppEntryContent).toMatchSnapshot();
  });
});
