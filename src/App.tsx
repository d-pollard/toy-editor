import React from 'react';
import { TimelineProvider } from './contexts/TimelineContext';
import SceneEditorLayout from './layout/SceneEditorLayout';
import SceneEditor from './components/SceneEditor/SceneEditor';
import './components/SceneEditor/sceneEditor.css';

function App() {
  return (
    <TimelineProvider>
      <SceneEditorLayout>
        <SceneEditor />
      </SceneEditorLayout>
    </TimelineProvider>
  );
}

export default App;
