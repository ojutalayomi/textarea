import React, { useState, useEffect, useRef, useMemo, useId, useCallback, useDeferredValue, startTransition } from 'react';
import P, { type EntityWithIndices } from './lib/text';
import type { TextAreaBoxProps } from './types';

/**
 * Builds an array of React elements with entity highlights for a given text segment.
 * Defined outside the component so it is never recreated on re-render.
 */
function buildHighlightedParts(
  text: string,
  getEntityProps: (entity: EntityWithIndices) => { type: string; href?: string; label?: string },
  classNamePrefix: string,
  highlightColor: string,
): React.ReactElement[] {
  const entities = P.extractEntitiesWithIndices(text);
  entities.sort((a: EntityWithIndices, b: EntityWithIndices) => a.indices[0] - b.indices[0]);

  const parts: React.ReactElement[] = [];
  let lastIndex = 0;

  entities.forEach((entity: EntityWithIndices) => {
    const before = text.slice(lastIndex, entity.indices[0]);
    if (before) parts.push(<span key={parts.length}>{before}</span>);

    const entityText = text.slice(entity.indices[0], entity.indices[1]);
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

  const after = text.slice(lastIndex);
  if (after) parts.push(<span key={parts.length}>{after}</span>);

  return parts;
}

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
    const textareaRef = useRef<HTMLTextAreaElement>(ref as unknown as HTMLTextAreaElement);
    const deferredText = useDeferredValue(text);
    const charsLeft = charLimit - text.length;

    /**
     * Handle text input.
     * No need to wrap/unwrap <limit> tags here — we simply store the raw value.
     */
    const handleInput = useCallback((
      e: React.ChangeEvent<HTMLTextAreaElement> | React.ClipboardEvent<HTMLTextAreaElement> | React.FormEvent<HTMLTextAreaElement>
    ) => {
      let value = '';
      if ('clipboardData' in e && e.clipboardData) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        // Insert at the current cursor position rather than replacing all content.
        const ta = e.currentTarget as HTMLTextAreaElement;
        const start = ta.selectionStart ?? ta.value.length;
        const end = ta.selectionEnd ?? ta.value.length;
        value = ta.value.slice(0, start) + pastedText + ta.value.slice(end);
      } else if ('currentTarget' in e && e.currentTarget && e.currentTarget.value !== undefined) {
        value = e.currentTarget.value;
      } else if ('target' in e && e.target && (e.target as HTMLTextAreaElement).value !== undefined) {
        value = (e.target as HTMLTextAreaElement).value;
      }

      if (isControlled) {
        onChange?.(value);
      } else {
        setInternalText(value);
      }
    }, [isControlled, onChange]);

    // Auto-expand textarea.
    // Cap against maxHeight directly — using previousElementSibling.clientHeight would
    // read the highlight div's height, which is driven by deferredText and lags behind
    // after a paste, causing the textarea to not expand to the correct size.
    useEffect(() => {
      const textarea = textareaRef.current;
      textarea!.style.height = 'auto';
      textarea!.style.height = `${Math.min(textarea!.scrollHeight, maxHeight)}px`;
    }, [charLimit, height, maxHeight, text]);

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
          href: entity.url,
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

    /**
     * Single memo that does ALL entity work in one pass:
     *   - builds highlighted React elements for the highlight layer
     *   - derives tags/urls for getDetails (no extra parsing passes)
     *
     * Uses deferredText so this heavy work doesn't block the keystroke.
     */
    const entityData = useMemo(() => {
      const mainText = deferredText.length > charLimit
        ? deferredText.slice(0, charLimit)
        : deferredText;
      const overflowText = deferredText.length > charLimit
        ? deferredText.slice(charLimit)
        : null;

      // --- Build highlighted parts for main text (one extraction call) ---
      const mainEntities = P.extractEntitiesWithIndices(mainText);
      mainEntities.sort((a: EntityWithIndices, b: EntityWithIndices) => a.indices[0] - b.indices[0]);

      const parts: React.ReactElement[] = [];
      let lastIndex = 0;

      // Derive tags/urls while iterating — no extra extraction passes needed
      const cashtags: string[] = [];
      const hashtags: string[] = [];
      const mentions: string[] = [];
      const urls: string[] = [];

      mainEntities.forEach((entity: EntityWithIndices) => {
        // Collect tag/url data
        if ('cashtag' in entity) cashtags.push(entity.cashtag);
        else if ('hashtag' in entity) hashtags.push(entity.hashtag);
        else if ('screenName' in entity) mentions.push(entity.screenName);
        else if ('url' in entity) urls.push(entity.url);

        // Build highlight elements
        const before = mainText.slice(lastIndex, entity.indices[0]);
        if (before) parts.push(<span key={parts.length}>{before}</span>);

        const entityText = mainText.slice(entity.indices[0], entity.indices[1]);
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

      const after = mainText.slice(lastIndex);
      if (after) parts.push(<span key={parts.length}>{after}</span>);

      // --- Overflow (beyond charLimit) ---
      if (overflowText) {
        const overflowParts = buildHighlightedParts(overflowText, getEntityProps, classNamePrefix, highlightColor);
        parts.push(
          <span key={parts.length} className="limit-content">
            {overflowParts}
          </span>
        );
      }

      return {
        highlightedText: parts,
        tags: { cash: cashtags, hash: hashtags, mention: mentions },
        urls,
      };
    }, [deferredText, charLimit, getEntityProps, classNamePrefix, highlightColor]);

    const clearText = useCallback(() => {
      if (isControlled) {
        onChange?.('');
      } else {
        setInternalText('');
      }
      requestAnimationFrame(() => textareaRef.current?.focus());
    }, [isControlled, onChange]);

    useEffect(() => {
      if (!getDetails) return;

      startTransition(() => {
        getDetails({
          charsLeft: charLimit - deferredText.length,
          text: deferredText,
          highlightedText: entityData.highlightedText,
          tags: entityData.tags,
          urls: entityData.urls,
          clearText,
        });
      });
    }, [charLimit, deferredText, getDetails, entityData, clearText]);

    // Handle Ctrl+Enter for submission
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === 'Enter' && text.length > 0 && charsLeft >= 0) {
        console.log('Tweet:', text); // Replace with API call
        if (isControlled) {
          onChange?.('');
        } else {
          setInternalText('');
        }
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
          {entityData.highlightedText}
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
