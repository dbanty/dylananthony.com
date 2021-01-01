import remark from "remark";
import html from "remark-html";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prism from "remark-prism";

export default async function markdownToHtml(
  markdown: string
): Promise<string> {
  const result = await remark().use(prism).use(html).process(markdown);
  return result.toString();
}
