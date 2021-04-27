import { FunctionComponent, memo, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
import { ATTR_DOMAIN_SLICE } from "../shared/constants";
/* // to consider for future releases
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
*/

const DocCardView: FunctionComponent<{content: string}> = memo((props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if (containerRef && containerRef.current) {
      containerRef.current.querySelectorAll('a').forEach((a)=>{
        if (!a.hasAttribute('target')) a.target = "_blank";
        if (a.rel === 'alternate') {
          processAlt(a);
        }
      });
    }
  }, [props.content])

  return <div className="view" ref={containerRef}>
    <ReactMarkdown rehypePlugins={[rehypeRaw, gfm]}>
      {props.content}
    </ReactMarkdown>
  </div>
  }, (prevProps, props) => {
    return prevProps.content !== props.content;
});

function processAlt(a:HTMLAnchorElement) {
  let urlChk;
  let theUrl;
  if (a.hasAttribute(ATTR_DOMAIN_SLICE)) {
    urlChk = window.location.protocol.concat("//").concat(window.location.host);
    theUrl = a.href.slice(0, urlChk.length);
  } else {
    urlChk = window.location.href;
    theUrl = a.href;
  }
  if (urlChk === theUrl) a.removeAttribute('href');
}

export default DocCardView;