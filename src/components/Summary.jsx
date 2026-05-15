import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import resume from '../data/resume.yaml';

const mdComponents = {
    p:      ({ children }) => <p className="text-secondary mb-2">{children}</p>,
    strong: ({ children }) => <strong className="text-dark fw-semibold">{children}</strong>,
};

export default function Summary() {
    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-transparent">
                <h1 className="card-title mb-0 fw-semibold">{resume.title}</h1>
            </div>
            <div className="card-body p-3 p-lg-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {resume.summary}
                </ReactMarkdown>
            </div>
        </div>
    );
}
