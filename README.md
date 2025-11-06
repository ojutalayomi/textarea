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
import { TextAreaBox, Detail } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';

function App() {
  const [details, setDetails] = useState(new Detail());

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
| `baseUrl` | `string` | `""` | Base URL for generated entity links |
| `getDetails` | `(details: Details) => void` | - | Callback to receive textarea details |
| `wrapperId` | `string` | generated | Optional id for wrapper div |
| `textareaId` | `string` | generated | Optional id for textarea element |
| `highlightId` | `string` | generated | Optional id for highlight layer |
| `wrapperClassName` | `string` | - | Extra class for wrapper (in addition to internal classes) |
| `textareaClassName` | `string` | - | Extra class for textarea |
| `highlightClassName` | `string` | - | Extra class for highlight layer |
| `classNamePrefix` | `string` | `txb` | Prefix for internal classes to avoid collisions |
| `legacyClassNames` | `boolean` | `true` | Include legacy generic classes for backward compatibility |

### Details Interface

```tsx
interface Details {
  charsLeft: number;  // Characters remaining
  text: string;      // Current text content
  highlightedText: React.ReactNode;
  /**
   * The extracted tags from the text
   */
  tags: {
    cash: string[],
    hash: string[],
    mention: string[],
  };
  /**
   * Urls in the text
   */
  urls: string[]
}
```

## Examples

### Basic Usage

```tsx
import React, { useState } from 'react';
import { TextAreaBox, Detail } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';

function TweetComposer() {
  const [details, setDetails] = useState(new Detail());

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

The stylesheet defines CSS variables you can override at the app level:

```css
:root {
  --font-size: 15px;
  --font-family: 'Courier New', Courier, monospace;
  --highlight-color: #1da1f2;
}
```

### Scoped class names and collision-avoidance

- Internal elements use prefixed classes (default prefix `txb`):
  - Wrapper: `txb-wrapper`
  - Textarea: `txb-textarea`
  - Highlight layer: `txb-highlight`
- A `data-textarea-box` attribute is set on the wrapper for additional scoping in CSS.
- Set `legacyClassNames={false}` to drop generic classes like `.textarea-wrapper` and `.highlight-layer` if you want to fully isolate styles from client stylesheets.

### Custom CSS Classes

The component uses the following CSS classes that you can customize:

- `.compose-box` - Main container
- `.textarea-wrapper` (legacy, optional) - Textarea wrapper
- `.highlight-layer` (legacy, optional) - Entity highlighting layer
- `.txb-wrapper` - Prefixed wrapper (scoped)
- `.txb-textarea` - Prefixed textarea (scoped)
- `.txb-highlight` - Prefixed highlight layer (scoped)
- `.highlight.hashtag` - Hashtag styling
- `.highlight.mention` - Mention styling
- `.highlight.url` - URL styling
- `.highlight.cashtag` - Cashtag styling
- `.char-counter` - Character counter
- `.char-counter.warning` - Warning state
- `.char-counter.error` - Error state
- `.limit-content` - Content beyond limit

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

# v1.2.0
- Updated type definitions (types.d.ts):
  - New optional props for IDs/classNames: `wrapperId`, `textareaId`, `highlightId`, `wrapperClassName`, `textareaClassName`, `highlightClassName`.
  - Added `classNamePrefix` (default: 'txb') and `legacyClassNames` (default: true) to avoid stylesheet collisions while keeping backward compatibility.
  - Internal accessibility updated: dynamic IDs generated with React `useId`; `aria-labelledby` references wrapper and textarea IDs.
  - Old minimal types (Details with `charsLeft` and `text`, and basic TextAreaBoxProps) replaced by richer `types.d.ts`.
- Styling changes:
  - Introduced scoped, prefixed classes (`txb-wrapper`, `txb-textarea`, `txb-highlight`) under `[data-textarea-box]` to prevent client stylesheet interference.
  - Kept legacy classes (`textarea-wrapper`, `highlight-layer`) enabled by default; can be disabled via `legacyClassNames={false}`.
  - Deduplicated and consolidated CSS rules in `src/style/index.css`; added CSS variables for font family/size and highlight color.
- Entity highlighting:
  - Entity anchor tags now also include the prefixed highlight class for easier scoping.
- No breaking changes expected; legacy classes remain by default. Set `legacyClassNames={false}` to fully isolate styles.