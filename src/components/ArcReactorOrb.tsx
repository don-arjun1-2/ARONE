import React from 'react';
import { ArcReactorCore } from './ArcReactorCore';

interface ArcReactorOrbProps {
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  onClick?: () => void;
  statusText?: string;
  size?: 'sm' | 'md' | 'lg';
  showSurroundArmor?: boolean;
}

export const ArcReactorOrb: React.FC<ArcReactorOrbProps> = ({
  isListening,
  isThinking,
  isSpeaking,
  onClick,
  statusText,
  size = 'md',
  showSurroundArmor = true,
}) => {
  return (
    <ArcReactorCore
      isListening={isListening}
      isThinking={isThinking}
      isSpeaking={isSpeaking}
      onClick={onClick}
      statusText={statusText}
      size={size}
      showSurroundArmor={showSurroundArmor}
      interactive={true}
    />
  );
};
