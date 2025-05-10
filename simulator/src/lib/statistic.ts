const loadStatistic = async () => {
	const res = await fetch("/statistics.json");
	const raw = await res.json();

	return raw;
};

export default loadStatistic;
