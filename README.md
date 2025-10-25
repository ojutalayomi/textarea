# React Textarea Enhanced

A powerful React textarea component with Twitter-like features including character limits, entity highlighting, and auto-expansion.

## Features

- 🎯 **Character Limit**: Configurable character limits with visual feedback
- 🔗 **Entity Highlighting**: Automatic detection and highlighting of hashtags, mentions, URLs, and cashtags
- 📏 **Auto-expansion**: Textarea automatically grows with content
- 🎨 **Customizable**: Flexible styling and configuration options
- 📱 **Responsive**: Works great on mobile and desktop
- 🌙 **Dark Mode**: Built-in dark mode support
- ⚡ **TypeScript**: Full TypeScript support with type definitions
- 🚀 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install react-textarea-enhanced
```

or

```bash
yarn add react-textarea-enhanced
```

**Note**: This package is compiled to JavaScript and includes TypeScript declarations, so it works with both JavaScript and TypeScript projects.

## Quick Start

```tsx
import React, { useState } from 'react';
import { TextAreaBox } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';

function App() {
  const [details, setDetails] = useState({ charsLeft: 280, text: '' });

  return (
    <div>
      <TextAreaBox 
        charLimit={280}
        getDetails={setDetails}
      />
      <div>Characters left: {details.charsLeft}</div>
    </div>
  );
}
```

## Props

### TextAreaBox

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `charLimit` | `number` | `480` | Maximum number of characters allowed |
| `height` | `number` | `450` | Maximum height of the textarea |
| `minHeight` | `number` | `250` | Minimum height of the textarea |
| `getDetails` | `(details: Details) => void` | - | Callback function to get textarea details |

### Details Interface

```tsx
interface Details {
  charsLeft: number;  // Characters remaining
  text: string;      // Current text content
}
```

## Examples

### Basic Usage

```tsx
import React, { useState } from 'react';
import { TextAreaBox } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';

function TweetComposer() {
  const [details, setDetails] = useState({ charsLeft: 280, text: '' });

  const handleSubmit = () => {
    if (details.text.length > 0 && details.charsLeft >= 0) {
      console.log('Posting:', details.text);
      // Handle post submission
    }
  };

  return (
    <div className="compose-box">
      <TextAreaBox 
        charLimit={280}
        getDetails={setDetails}
      />
      <button 
        onClick={handleSubmit}
        disabled={details.text.length === 0 || details.charsLeft < 0}
        className="tweet-button"
      >
        Tweet
      </button>
      <div className={`char-counter ${details.charsLeft <= 20 ? 'warning' : ''} ${details.charsLeft <= 0 ? 'error' : ''}`}>
        {details.charsLeft}
      </div>
    </div>
  );
}
```

### Custom Styling

```tsx
import React from 'react';
import { TextAreaBox } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';

function CustomTextarea() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <TextAreaBox 
        charLimit={500}
        height={300}
        minHeight={100}
        getDetails={(details) => console.log(details)}
      />
    </div>
  );
}
```

### With Form Integration

```tsx
import React, { useState } from 'react';
import { TextAreaBox } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';

function ContactForm() {
  const [message, setMessage] = useState({ charsLeft: 1000, text: '' });
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.text.length > 0) {
      console.log('Form submitted:', { name, message: message.text });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
      />
      <TextAreaBox 
        charLimit={1000}
        getDetails={setMessage}
      />
      <button type="submit" disabled={message.text.length === 0}>
        Send Message
      </button>
    </form>
  );
}
```

## Styling

The component comes with built-in CSS that you can import:

```tsx
import 'react-textarea-enhanced/dist/index.css';
```

### Custom CSS Classes

The component uses the following CSS classes that you can customize:

- `.compose-box` - Main container
- `.textarea-wrapper` - Textarea wrapper
- `.highlight-layer` - Entity highlighting layer
- `.highlight.hashtag` - Hashtag styling
- `.highlight.mention` - Mention styling
- `.highlight.url` - URL styling
- `.highlight.cashtag` - Cashtag styling
- `.char-counter` - Character counter
- `.char-counter.warning` - Warning state
- `.char-counter.error` - Error state
- `.limit-content` - Content beyond limit

### Dark Mode

The component automatically supports dark mode using `prefers-color-scheme: dark`:

```css
@media (prefers-color-scheme: dark) {
  .compose-box {
    background: #15202b;
    border-color: #2f3336;
  }
}
```

## Keyboard Shortcuts

- `Ctrl + Enter`: Submit the textarea content (triggers console.log by default)

## Dependencies

- React 16.8+ (hooks support)
- twitter-text: For robust entity parsing

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## TypeScript

Full TypeScript support is included with comprehensive type definitions:

```tsx
import { TextAreaBox, TextAreaBoxProps, Details } from 'react-textarea-enhanced';
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Ojutalayo Ayomide Josiah](https://github.com/ojutalayomi)

## Changelog

### 1.0.0
- Initial release
- TextAreaBox component with character limits
- Entity highlighting (hashtags, mentions, URLs, cashtags)
- Auto-expansion functionality
- TypeScript support
- Dark mode support