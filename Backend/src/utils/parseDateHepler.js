const parseDateSafe = (dateString) => {
    const d = dayjs(dateString);
    if (!d.isValid()) return null;
    return d.toISOString();
};

module.exports = parseDateSafe;