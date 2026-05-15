import resume from '../data/resume.yaml';

export default function Skills() {
    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-transparent">
                <h2 className="card-title mb-0 fw-semibold">Skills</h2>
            </div>
            <div className="card-body p-3 p-lg-4">
                {resume.skills.map((skill, i) => (
                    <div key={i} className="mb-3">
                        <h3 className="fw-semibold fs-6 text-dark mt-0 mb-2">{skill.category}</h3>
                        <div>
                            {skill.items.map((item, j) => (
                                <span key={j} className="badge bg-light text-dark border fw-normal me-1 mb-1">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
