import React, { useState, useEffect, useRef, useMemo, useId, useCallback } from 'react';
import P, { type EntityWithIndices } from './lib/text';
import type { TextAreaBoxProps } from './types';

/**
 * TextAreaBox component
 *
 * A customizable textarea component with entity highlighting, character limit enforcement,
 * and detail extraction (tags, URLs, hashtags, cashtags, and mentions).
 *
 * @param {number} [charLimit=10000] - The maximum number of characters allowed in the text area.
 * @param {number} [height] - The height of the text area in pixels.
 * @param {number} [minHeight=30] - The minimum height of the text area in pixels.
 * @param {number} [maxHeight=450] - The maximum height of the text area in pixels.
 * @param {string|React.CSSProperties['fontFamily']} [fontFamily='Courier New, Courier, monospace'] - The font family of the text area.
 * @param {string} [baseUrl] - The base URL for anchor tags in the text area component.
 * @param {(details: import('./types').Details) => void} [getDetails] - Callback that receives field details such as:
 *        - charsLeft: number - characters remaining
 *        - text: string - current content
 *        - highlightedText: React.ReactNode - rendered highlighted text
 *        - tags: {cash: string[], hash: string[], mention: string[]} - extracted entity tags
 *        - urls: string[] - extracted URLs
 * @param {string} [wrapperId] - Optional id for the outer wrapper div. Defaults to a generated id.
 * @param {string} [textareaId] - Optional id for the textarea element. Defaults to a generated id.
 * @param {string} [highlightId] - Optional id for the highlight layer div. Defaults to a generated id.
 * @param {string} [wrapperClassName] - Class applied to the outer wrapper. Backward-compatible alias of className.
 * @param {string} [textareaClassName] - Additional class applied to the textarea element.
 * @param {string} [highlightClassName] - Additional class applied to the highlight layer div.
 * @param {string} [classNamePrefix='txb'] - Optional class name prefix for internal elements to avoid collisions.
 * @param {boolean} [legacyClassNames=false] - Disable to minimize interference from client stylesheets.
 * @param {string} [highlightColor='#1da1f2'] - The color for entity highlights.
 * @param {object} [...props] - Additional props forwarded to the textarea element.
 * @returns {JSX.Element} The text area box with highlighting and enhanced features.
 *
 * @typedef {import('./types').TextAreaBoxProps} TextAreaBoxProps
 */
const TextAreaBox = React.forwardRef<HTMLTextAreaElement, TextAreaBoxProps>(
  ({
    className = "",
    wrapperClassName,
    textareaClassName,
    highlightClassName,
    wrapperId: wrapperIdProp,
    textareaId: textareaIdProp,
    highlightId: highlightIdProp,
    classNamePrefix = 'txb',
    legacyClassNames = false,
    charLimit = 10000,
    height,
    minHeight = 30,
    maxHeight = 450,
    fontFamily = 'Courier New, Courier, monospace',
    highlightColor = '#1da1f2',
    baseUrl = "",
    getDetails,
    value: controlledValue,
    onChange,
    ...props
  }, ref) => {
    const reactId = useId();
    const wrapperId = wrapperIdProp ?? `textarea-wrapper-${reactId}`;
    const textareaId = textareaIdProp ?? `textarea-${reactId}`;
    const highlightId = highlightIdProp ?? `highlight-layer-${reactId}`;
    
    // Use controlled value if provided, otherwise use internal state
    const isControlled = controlledValue !== undefined;
    const [internalText, setInternalText] = useState('');
    
    const text = isControlled ? (controlledValue ?? '') : internalText;
    const [unformattedText, setUnformattedText] = useState('');
    const [charsLeft, setCharsLeft] = useState(charLimit);
    const textareaRef = useRef<HTMLTextAreaElement>(ref as unknown as HTMLTextAreaElement);
    const regex = useMemo(() => /\s*<limit>([\s\S]*?)<\/limit>/, []);
  
    const getFinalText = useCallback((value: string, charLimit: number) => {
      let finalText = '';
      if (value.length > charLimit) {
        // If already wrapped with <limit>, preserve as is
        if (value.includes('<limit>') && value.includes('</limit>')) {
          finalText = value;
        } else {
          finalText = value.slice(0, charLimit) + `<limit>${value.slice(charLimit)}</limit>`;
        }
      } else {
        finalText = value;
      }
      return finalText;
    }, []);
    
    /**
     * Handle text input
     */
    const handleInput = useCallback((
      e: React.ChangeEvent<HTMLTextAreaElement> | React.ClipboardEvent<HTMLTextAreaElement> | React.FormEvent<HTMLTextAreaElement>
    ) => {
      let value = '';
      if ('clipboardData' in e && e.clipboardData) {
        e.preventDefault();
        value = e.clipboardData.getData('text');
      } else if ('currentTarget' in e && e.currentTarget && e.currentTarget.value !== undefined) {
        value = e.currentTarget.value;
      } else if ('target' in e && e.target && (e.target as HTMLTextAreaElement).value !== undefined) {
        value = (e.target as HTMLTextAreaElement).value;
      }

      const finalText = getFinalText(value, charLimit);
      const re = regex.exec(finalText);
      let theText = finalText.slice(0, charLimit);
      if (finalText.length > charLimit && re) {
        theText += re[1];
      }

      // Update state based on controlled/uncontrolled mode
      if (isControlled) {
        onChange?.(theText);
      } else {
        setInternalText(theText);
      }
      setUnformattedText(finalText);
    }, [charLimit, regex, isControlled, onChange, getFinalText]);
  
    // Sync unformattedText when controlled value changes
    useEffect(() => {
      if (isControlled && controlledValue !== undefined) {
        const finalText = getFinalText(controlledValue, charLimit);
        setUnformattedText(finalText);
      }
    }, [isControlled, controlledValue, charLimit, getFinalText]);
  
    // Auto-expand textarea and update counter
    useEffect(() => {
      const textarea = textareaRef.current;
      textarea!.style.height = 'auto';
      textarea!.style.height = `${Math.min(textarea!.scrollHeight, textarea!.previousElementSibling!.clientHeight)}px`;
      setCharsLeft(charLimit - text.length);
    }, [charLimit, height, text]);
  
    // Helper to determine entity type and generate href
    const getEntityProps = useCallback((entity: EntityWithIndices) => {
      if ('hashtag' in entity) {
        return {
          type: 'hashtag',
          href: `${baseUrl}/hashtag/${encodeURIComponent(entity.hashtag)}`,
          label: `Search for hashtag ${entity.hashtag}`,
        };
      }
      if ('screenName' in entity) {
        return {
          type: 'mention',
          href: `${baseUrl}/${encodeURIComponent(entity.screenName)}`,
          label: `View profile for ${entity.screenName}`,
        };
      }
      if ('url' in entity) {
        return {
          type: 'url',
          href: entity.url, // Already normalized by twitter-text
          label: `Open link ${entity.url}`,
        };
      }
      if ('cashtag' in entity) {
        return {
          type: 'cashtag',
          href: `${baseUrl}/search?q=${encodeURIComponent(entity.cashtag)}`,
          label: `Search for cashtag ${entity.cashtag}`,
        };
      }
      return { type: '' };
    }, [baseUrl]);
  
    // Memoized highlighted text using twitter-text for robust parsing
    const highlightedText = useMemo(() => {
      const re = regex.exec(unformattedText);
  
      const entityHandler = (text: string, limit = true) => {
        const theText = text.length > charLimit && limit ? text.slice(0, charLimit) : text;
        
        // Extract entities with indices (robust handling of Unicode, punctuation, etc.)
        const entities = P.extractEntitiesWithIndices(theText);
  
        // Sort by start index (though usually pre-sorted)
        entities.sort((a: EntityWithIndices, b: EntityWithIndices) => a.indices[0] - b.indices[0]);
  
        const parts: React.ReactElement[] = [];
        let lastIndex = 0;

        entities.forEach((entity: EntityWithIndices) => {
          // Plain text before entity
          const before = theText.slice(lastIndex, entity.indices[0]);
          if (before) {
            parts.push(<span key={parts.length}>{before}</span>);
          }
  
          // Highlighted entity
          const entityText = theText.slice(entity.indices[0], entity.indices[1]);
          const { type, href, label } = getEntityProps(entity);
          parts.push(
            <a
              key={parts.length}
              className={`highlight ${type} ${classNamePrefix}-highlight`}
              style={{ color: highlightColor }}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              {entityText}
            </a>
          );
  
          lastIndex = entity.indices[1];
        });
  
        // Remaining plain text
        const after = theText.slice(lastIndex);
        if (after) {
          parts.push(<span key={parts.length}>{after}</span>);
        }
        return { parts, theText };
      }
  
      const { parts } = entityHandler(text);
  
      if (text.length > charLimit && re) {
        parts.push(<span key={parts.length} className='limit-content'>{entityHandler(re[1], false).parts}</span>);
      }
      
      return parts;
    }, [charLimit, regex, text, unformattedText, getEntityProps, classNamePrefix, highlightColor]);
  
    const clearText = useCallback(() => {
      if (isControlled) {
        onChange?.('');
      } else {
        setInternalText('');
      }
      setUnformattedText('');
      setCharsLeft(charLimit);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }, [charLimit, isControlled, onChange]);
    
    useEffect(() => {
      getDetails?.({
        charsLeft,
        text,
        highlightedText,
        tags: {
          cash: P.extractCashtags(text),
          hash: P.extractHashtags(text),
          mention: P.extractMentions(text),
        },
        urls: P.extractUrls(text),
        clearText,
      });
    }, [charsLeft, getDetails, highlightedText, text, clearText]);
  
    // Handle Ctrl+Enter for submission
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === 'Enter' && text.length > 0 && charsLeft >= 0) {
        console.log('Tweet:', text); // Replace with API call
        if (isControlled) {
          onChange?.('');
        } else {
          setInternalText('');
        }
        setUnformattedText('');
      }
    }, [charsLeft, text, isControlled, onChange]);
  
    const wrapperBaseClass = legacyClassNames ? 'textarea-wrapper ' : '';
    const wrapperPrefixedClass = `${classNamePrefix}-wrapper`;
    const highlightBaseClass = legacyClassNames ? 'highlight-layer' : '';
    const highlightPrefixedClass = `${classNamePrefix}-highlight-layer`;
    const textareaPrefixedClass = `${classNamePrefix}-textarea`;

    const { style, ...rest } = props;

    return (
      <div
        id={wrapperId}
        data-textarea-box
        onClick={() => {
          textareaRef.current?.focus();
        }}
        className={(wrapperBaseClass + wrapperPrefixedClass + (wrapperClassName ? ' ' + wrapperClassName : '') + (className ? ' ' + className : '')).trim()}
        style={{ 
          ...(maxHeight && { maxHeight: `${maxHeight}px` }), 
          ...(minHeight && { minHeight: `${minHeight}px` }), 
          ...(height && { height: `${height}px` }), 
          ...style 
        }}
      >
        <div
          id={highlightId}
          className={([highlightBaseClass, highlightPrefixedClass, highlightClassName].filter(Boolean) as string[]).join(' ')}
          style={{ minHeight: `${minHeight}px`, fontFamily: fontFamily }}
        >
          {highlightedText}
        </div>
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="What's happening?"
          rows={1}
          aria-labelledby={`${wrapperId} ${textareaId}`}
          className={([textareaPrefixedClass, legacyClassNames ? undefined : undefined, textareaClassName].filter(Boolean) as string[]).join(' ')}
          style={{ minHeight: `${minHeight}px`, fontFamily, ...(height && { height: `${height}px` }) }}
          {...rest}
        />
      </div>
    );
  }
);
TextAreaBox.displayName = "TextAreaBox";

export default TextAreaBox;