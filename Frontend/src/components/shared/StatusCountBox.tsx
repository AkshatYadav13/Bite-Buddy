
const StatusCountBox = ({
  statusMap,
}: {
  statusMap: Record<string, number>;
}) => {
  const statusColors: Record<string, string> = {
    Pending:  "from-pink-200 to-pink-100 text-pink-900",
    Placed: "from-yellow-200 to-yellow-100 text-yellow-900" ,
    Confirmed: "from-yellow-200 to-yellow-100 text-yellow-900",
    ReadyForPickup: "from-purple-200 to-purple-100 text-purple-900",
    AcceptedByAgent: "from-blue-200 to-blue-100 text-blue-900",
    OutForDelivery: "from-orange-200 to-orange-100 text-orange-900",
    Delivered: "from-green-200 to-green-100 text-green-900",
    Canceled: "from-red-200 to-red-100 text-red-900",
  };

  const statusPriority = [
    "Pending",
    "Placed",
    "Confirmed",
    "ReadyForPickup",
    "AcceptedByAgent",
    "OutForDelivery",
    "Delivered",
    "Canceled",
  ];

  const sortedStatus = Object.entries(statusMap).sort(
    (a, b) => statusPriority.indexOf(a[0]) - statusPriority.indexOf(b[0])
  );

  return (
    <div className="flex flex-wrap gap-3 mb-6 w-fit  dark:bg-input  p-3 rounded-xl shadow-lg backdrop-blur-md">
      {sortedStatus.map(([status, count]) => (
        <div
          key={status}
          className={`px-4 py-1 rounded-full text-sm font-semibold shadow-md bg-gradient-to-br ${statusColors[status] || "from-gray-200 to-gray-100 text-gray-800"} backdrop-blur-sm border border-white/20`}
        >
          {status}: {count}
        </div>
      ))}
    </div>
  );
};

export default StatusCountBox