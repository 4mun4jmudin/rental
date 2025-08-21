import { forwardRef, useRef } from 'react';

export default forwardRef(function Textarea({ className = '', ...props }, ref) {
    const localRef = ref || useRef();

    return (
        <textarea
            {...props}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            ref={localRef}
        />
    );
});