import type { ReactNode } from "react";

/**
 * The details of the text area
 */
export interface Details {
  /**
   * The number of characters left in the text area
   */
  charsLeft: number;
  /**
   * The text in the text area
   */
  text: string;
  /**
   * The generated highlightedText from the text area
   */
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

/**
 * Detail Class is to be used as a placeholder in your React useState
 */
export class Detail implements Details {
  charsLeft: number;
  text: string;
  highlightedText: ReactNode;
  tags: { hash: string[]; cash: string[]; mention: string[]; };
  urls: string[];

  constructor () {
    this.charsLeft = 0;
    this.text = "";
    this.highlightedText = null;
    this.tags = {
      cash: [],
      hash: [],
      mention: []
    };
    this.urls = []
  }

}

/**
 * The props for the text area box
 */
export interface TextAreaBoxProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * The maximum number of characters allowed in the text area
   * @default 480
   * @type {number}
   */
  charLimit?: number;
  /**
   * The height of the text area
   * @default 450
   * @type {number}
   */
  height?: number;
  /**
   * The minimum height of the text area
   * @default 250
   * @type {number}
   */
  minHeight?: number;
  /**
   * The font size of the text area
   * @default 15px
   * @type {number}
   */
  fontSize?: number;
  /**
   * The font family of the text area
   * @default 'Courier New', Courier, monospace
   * @type {string}
   */
  fontFamily?: string | React.CSSProperties['fontFamily'];
  /**
   * The base url for anchor tags in the text area component
   * @default undefined
   * @type {string}
   */
  baseUrl?: string;
  /**
   * A function to get the details of the text area
   * @param details - The details of the text area
   * @returns void
   */
  getDetails?: (details: Details) => void;
  /**
   * Optional id for the outer wrapper div. Defaults to a generated id.
   */
  wrapperId?: string;
  /**
   * Optional id for the textarea element. Defaults to a generated id.
   */
  textareaId?: string;
  /**
   * Optional id for the highlight layer div.
   */
  highlightId?: string;
  /**
   * Class applied to the outer wrapper. Backward-compatible alias of className.
   */
  wrapperClassName?: string;
  /**
   * Additional class applied to the textarea element.
   */
  textareaClassName?: string;
  /**
   * Additional class applied to the highlight layer div.
   */
  highlightClassName?: string;
  /**
   * Optional class name prefix for internal elements to avoid collisions.
   * @default 'txb'
   */
  classNamePrefix?: string;
  /**
   * Disable to minimize interference from client stylesheets.
   * @default true
   */
  legacyClassNames?: boolean;
  /**
   * The color of the highlight
   * @default '#1da1f2'
   * @type {string}
   */
  highlightColor?: string;
}
