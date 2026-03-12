const NumberFormat = ({ value }) => {
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-IN").format(Math.round(num));
  };

  return <span>{formatNumber(value)}</span>;
};

export default NumberFormat;