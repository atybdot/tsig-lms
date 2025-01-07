import MenteeAcc from "./MenteeAcc";

const MenteeAccordion = ({ mentees }) => {

  return (
    <div className="mt-6">
      {mentees.map((mentee, index) => (
        <MenteeAcc key={mentee.id} mentee={mentee} index={index} />
      ))}
    </div>
  );
};

export default MenteeAccordion; 