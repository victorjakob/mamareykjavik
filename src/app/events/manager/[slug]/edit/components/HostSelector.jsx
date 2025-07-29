export default function HostSelector({ register, error, isAdmin, hostUsers }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Host Email
      </label>
      {isAdmin ? (
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
      ) : (
        <input
          type="email"
          {...register("host")}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          placeholder="Enter host email"
          defaultValue="team@whitelotus.is"
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
