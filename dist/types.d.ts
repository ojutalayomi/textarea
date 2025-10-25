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
}
/**
 * The props for the text area box
 */
export interface TextAreaBoxProps {
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
     * A function to get the details of the text area
     * @param details - The details of the text area
     * @returns void
     */
    getDetails?: (details: Details) => void;
}
