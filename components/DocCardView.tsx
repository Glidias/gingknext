import { FunctionComponent, memo } from "react"
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
/* // to consider for future releases
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
*/

const DocCardView: FunctionComponent<{content: string}> = memo((props) => {
	return <div className="view">
	<ReactMarkdown rehypePlugins={[rehypeRaw, gfm]}>
		{props.content}
	</ReactMarkdown>
	</div>
	}, (prevProps, props) => {
		return prevProps.content !== props.content;
});

export default DocCardView;