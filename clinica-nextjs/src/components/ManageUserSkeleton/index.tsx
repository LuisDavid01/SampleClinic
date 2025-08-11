export default function ManageUserSkeleton() {
  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-card p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-700" />
                <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-600" />
              </div>
              <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Lista de usuarios */}
      <section className="space-y-3 sm:space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-card transition-shadow hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Info principal */}
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 sm:h-14 sm:w-14" />
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-600 sm:h-6 sm:w-56" />
                      <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-700" />
                      <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-700 sm:w-64" />
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-1 gap-2 sm:w-[520px] sm:grid-cols-3">
                  <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="h-9 w-full rounded-md bg-gray-100 dark:bg-gray-800" />
                  <div className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-600" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}