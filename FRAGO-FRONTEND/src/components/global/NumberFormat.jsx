const NumberFormat = ({ value }) => {
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "";
    const stringValue = value.toString();
    return new Intl.NumberFormat("en-IN").format(stringValue.replace(/\D/g, ""));
  };

  return <span>{formatNumber(value)}</span>;
};

export default NumberFormat;