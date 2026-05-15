import resume from '../data/resume.yaml';

export default function Strengths() {
    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-transparent">
                <h2 className="card-title mb-0 fw-semibold">Strengths</h2>
            </div>
            <div className="card-body p-3 p-lg-4">
                <ul className="text-secondary ps-3 mb-0">
                    {resume.strengths.map((item, i) => (
                        <li key={i} className="mb-1">{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
