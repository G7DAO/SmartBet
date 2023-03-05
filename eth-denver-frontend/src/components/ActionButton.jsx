const ActionButton = ({ handleClick, label }) => {
  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 bg-inherit text-white text-xs rounded-md border-2 border-white hover:text-black hover:bg-white"
    >
      {label}
    </button>
  );
};

export default ActionButton;
