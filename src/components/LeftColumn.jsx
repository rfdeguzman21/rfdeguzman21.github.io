import Profile from './Profile';
import Strengths from './Strengths';
import Skills from './Skills';

export default function LeftColumn() {
    return (
        <div className="d-flex flex-column gap-4">
            <Profile />
            <Strengths />
            <Skills />
        </div>
    );
}
