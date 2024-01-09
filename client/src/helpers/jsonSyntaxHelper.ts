/* eslint-disable @typescript-eslint/quotes */

export class JsonSyntaxHelper {
  /**
   * Highlight the json.
   * @param json The json to highlight.
   * @returns The highlighted json.
   */
  public static syntaxHighlight(json: string): string {
    return json
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll(
        // eslint-disable-next-line max-len
        /("(\\u[\dA-Za-z]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?)/g,
        (match) => {
          let cls = "number";
          if (match.startsWith('"')) {
            cls = match.endsWith(":") ? "key" : "string";
          } else if (/true|false/.test(match)) {
            cls = "boolean";
          } else if (match.includes("null")) {
            cls = "null";
          }
          return `<span class="${cls}">${match}</span>`;
        },
      );
  }
}
