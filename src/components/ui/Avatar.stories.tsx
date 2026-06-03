import React from 'react';
import { Avatar, AvatarFallback } from './avatar';

const meta = { title: 'UI/Avatar', component: Avatar };

export default meta;

export const Small = () => (
  <Avatar className="h-7 w-7">
    <AvatarFallback className="text-xs">Au</AvatarFallback>
  </Avatar>
);
export const Medium = () => (
  <Avatar className="h-9 w-9">
    <AvatarFallback className="text-sm">Au</AvatarFallback>
  </Avatar>
);
export const Large = () => (
  <Avatar className="h-11 w-11">
    <AvatarFallback className="text-base">Au</AvatarFallback>
  </Avatar>
);
