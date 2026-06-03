import React from 'react';
import { Button } from './button';

const meta = { title: 'UI/Button', component: Button };

export default meta;

export const Primary = () => <Button variant="primary">Primary</Button>;
export const Secondary = () => <Button variant="secondary">Secondary</Button>;
export const Ghost = () => <Button variant="ghost">Ghost</Button>;
export const Link = () => <Button variant="link">Link</Button>;
