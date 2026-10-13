// MongoDB transactions require a replica set or mongos. On a standalone
// instance the server throws "Transaction numbers are only allowed on a
// replica set member or mongos" — but only when an actual operation runs
// under the session. `startTransaction()`/`abortTransaction()` are local
// state changes that don't contact the server, so probing with just those
// would falsely return `true`.
//
// We check the topology directly via `serverStatus.repl` (set only on
// replica-set / mongos members). Cached after first call.

let supportsCache = null;

export async function supportsTransactions(mongoose) {
    if (supportsCache !== null) return supportsCache;
    try {
        const admin = mongoose.connection.db.admin();
        const status = await admin.serverStatus();
        // `repl` is present on replica-set primaries/secondaries and on
        // mongos routers; standalone `mongod` doesn't expose it.
        supportsCache = Boolean(status?.repl);
    } catch {
        supportsCache = false;
    }
    return supportsCache;
}
