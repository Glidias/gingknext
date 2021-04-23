import { FunctionComponent, memo, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
/* // to consider for future releases
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
*/

const DocCardView: FunctionComponent<{content: string}> = memo((props) => {

  const containerRef = useRef<HTMLDivElement>(null);

	useEffect(()=>{
    if (containerRef && containerRef.current) {
      containerRef.current.querySelectorAll('a').forEach((a)=>{
        a.target = "_blank";
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

export default DocCardView;