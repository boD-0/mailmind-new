import React from 'react';
import { Input } from './input';

export default { title: 'UI/Input', component: Input };

export const Default = () => <Input label="Work email" placeholder="you@company.com" />;
export const WithError = () => <Input label="Password" placeholder="Create password" error="Password must be at least 8 characters." />;
