(function () {
    // export Gard
    if (typeof window != 'undefined') {
        window.gard = gard;
    } else if (typeof exports != 'undefined') {
        module.exports = gard;
    }

    /**
     * @param object {Object} Javascript object you want to protect.
     *
     * @param permissions {Array|Object|Function<Array|Object>}
     *     Permissions definition. If array of property names is given then
     *     these properties will have "readwrite" permissions set and the other
     *     will have "none". If object is given, then each property should
     *     represent a Gard permission. Not specified properties will have
     *     "none" permission.
     *
     * @param forbidden {Function}
     *     This function is called when access of a property is forbidden.
     *     Few arguments are passed into the function. The first is property
     *     name, the second is accessed object, the third is either gard.GET
     *     or gard.SET or gard.DEL and the fourth is passed only with
     *     gard.GET and represents typeof value of accessed property. You
     *     can return value that will be returned when forbidden property is
     *     accessed.
     *
     * @returns {Object}
     *     Returned object represents the passed object but with defined
     *     restrictions.
     */
    function gard(object, permissions, forbidden) {
        if (typeof permissions == 'function') {
            permissions = permissions();
        }

        permissions = parsePermissions(permissions);

        forbidden = forbidden || Function();

        var defaultPermission = permissions['*'] || gard.NONE;

        // bind all functions explicitly to the object so "this" refers
        // to the object not to the proxy (so permissions checks do not apply
        // inside these functions)
        for (var i = 0, keys = Object.keys(object); i < keys.length; i++) {
            if (typeof object[keys[i]] == 'function') {
                object[keys[i]] = object[keys[i]].bind(object);
            }
        }

        return new Proxy(object, {
            get: function (target, property) {
                // if object does not have the property, return undefined
                if (typeof target[property] == 'undefined') { return; }

                // get the set permission or the default one
                var permission = permissions[property] || defaultPermission;

                if (permission & gard.READ) {
                    // check the permission and return the value if true
                    return target[property];
                } else {
                    // call forbidden handler and return its returned value
                    var type = typeof target[property];
                    return forbidden(property, target, gard.GET, type);
                }
            },
            set: function (target, property, val) {
                // get the set permission or the default one
                var permission = permissions[property] || defaultPermission;

                if (permission & gard.WRITE) {
                    // check the permission and set the value if true
                    target[property] = val;
                } else {
                    // call forbidden handler
                    forbidden(property, target, gard.SET);
                }
            },
            has: function (target, property) {
                // if object does not have the property, return false
                if (typeof target[property] == 'undefined') { return false; }

                // get the set permission or the default one
                var permission = permissions[property] || defaultPermission;

                // check the permission and return the result
                return Boolean(permission & gard.READ);
            },
            enumerate: function (target) {
                var ownKeys = this.ownKeys(target);

                return {
                    next: function () {
                        var done = ownKeys.length === 0;
                        var value = done ? undefined : ownKeys.shift();

                        return {
                            done: done,
                            value: value
                        };
                    }
                };
            },
            ownKeys: function (target) {
                return Object.keys(target).filter(function (property) {
                    return this.has(target, property);
                }, this);
            },
            deleteProperty: function (target, property) {
                // if object does not have the property, return false
                if (typeof target[property] == 'undefined') { return false; }

                // get the set permission or the default one
                var permission = permissions[property] || defaultPermission;

                if (permission & gard.DELETE) {
                    // check the permission and delete the property
                    delete target[property];
                    return true;
                } else {
                    // call forbidden handler and return its returned value
                    forbidden(property, target, gard.DEL);
                    return false;
                }
            }
        });
    }

    gard.NONE = 0;      // 000
    gard.READ = 1;      // 001
    gard.WRITE = 2;     // 010
    gard.DELETE = 4;    // 100
    gard.READWRITE = 3; // 011
    gard.ALL = 7;       // 111
    gard.CALL = gard.READ;

    gard.GET = 'get';
    gard.SET = 'set';
    gard.DEL = 'delete';

    function parsePermissions(permissions) {
        if (typeof permissions == 'undefined') { return {}; }

        if (Array.isArray(permissions)) {
            var temp = Object.create(null);

            permissions.forEach(function (permission) {
                temp[permission] = gard.ALL;
            });

            permissions = temp;
        }

        return permissions;
    }
})();
