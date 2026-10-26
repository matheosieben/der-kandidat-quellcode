import { Masthead } from "./masthead";

export function ArticleHeader({ ressort }: { ressort: string }) {
  return <Masthead ressort={ressort} />;
}
