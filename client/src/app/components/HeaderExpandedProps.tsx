import { ReactNode } from "react";

/**
 * The props for the Header component.
 */
export interface HeaderExpandedProps {
   /**
    * The label for the dropdown.
    */
   label: string;

   /**
    * The description above the label.
    */
   eyebrow?: string;

   /**
* The children.
*/
   children?: ReactNode | ReactNode[];
   /**
* The additional CSS class.
*/
   className?: string;
}
