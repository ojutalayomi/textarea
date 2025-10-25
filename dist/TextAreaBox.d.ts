import { TextAreaBoxProps } from './types';
/**
 * The text area box
 *
 * @param charLimit - The maximum number of characters allowed in the text area
 * @param height - The height of the text area
 * @param minHeight - The minimum height of the text area
 * @param getDetails - A function to get the details of the text area
 * @returns The text area box
 */
declare const TextAreaBox: ({ charLimit, height, minHeight, getDetails }: TextAreaBoxProps) => import("react/jsx-runtime").JSX.Element;
export default TextAreaBox;
