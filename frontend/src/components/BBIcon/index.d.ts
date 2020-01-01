import * as React from 'react';
export interface IBBIconProps {
  type: string;
  className?: string;
  title?: string;
  onClick?: React.MouseEventHandler<any>;
  style?: React.CSSProperties;
}

export default class BBIcon extends React.Component<IBBIconProps, any> {}
