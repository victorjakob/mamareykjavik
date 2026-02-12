export default function HostSelector({ register, error, isAdmin, hostUsers }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Event manager emails
      </label>
      <p className="text-xs text-gray-500 mb-3">
        These emails can edit/manage the event and will receive signup
        notifications.
      </p>
      {isAdmin ? (
        <>
          <select
            {...register("host")}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="team@whitelotus.is">team@whitelotus.is</option>
            {hostUsers?.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>
          <select
            {...register("host_secondary")}
            className="mt-3 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            defaultValue=""
          >
            <option value="">(No second manager)</option>
            <option value="team@whitelotus.is">team@whitelotus.is</option>
            {hostUsers?.map((user) => (
              <option key={`secondary-${user.email}`} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <input
            type="email"
            {...register("host")}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            placeholder="Manager email 1 (required)"
            defaultValue="team@whitelotus.is"
          />
          <input
            type="email"
            {...register("host_secondary")}
            className="mt-3 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            placeholder="Manager email 2 (optional)"
            defaultValue=""
          />
        </>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
