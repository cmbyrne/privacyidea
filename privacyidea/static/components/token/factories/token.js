/**
 * http://www.privacyidea.org
 * (c) cornelius kölbel, cornelius@privacyidea.org
 *
 * 2015-11-30 Cornelius Kölbel <cornelius@privacyidea.org>
 *     Add method to retrieve challenges
 * 2015-01-11 Cornelius Kölbel, <cornelius@privacyidea.org>
 *
 * This code is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
function fixUser(user) {
    //debug: console.log("User In: " + user);
    if (user) {
        var stripUser = user.match(/^\[.*\] (.*) \(.*\).*$/);
        if (stripUser != undefined) {
            user = stripUser[1];
        }
    } else {
        user = "";
    }
    //debug: console.log("User Out: " + user);
    return user;
}

function fixSerial(serial) {
    //debug: console.log("Serial In: " + serial);
    if (serial) {
        var stripSerial = serial.match(/^(.*) \(.*\).*$/);
        if (stripSerial != undefined) {
            serial = stripSerial[1];
        }
    } else {
        serial = "";
    }
    //debug: console.log("Serial Out: " + serial);
    return serial;
}


function fixMachine(machinestr) {
    /*
     * This takes a machinestring of the format of
     *   <hostname> [<IP>] (<machineid> in <machineresolver>)
     * and returns a machineObject of
     *  mo.id
     *  mo.resolver
     *  mo.hostname
     *  mo.ip
     */
    var machineObject = {};
    //debug: console.log("Machine In: " + machinestr);
    if (machinestr) {
        var stripMachine = machinestr.match(/^(.*) \[(.*)\] \((.*) in (.*)\)$/);
        if (stripMachine != undefined) {
            machineObject = {id: stripMachine[3], resolver: stripMachine[4],
                hostname: stripMachine[1], ip: stripMachine[2]};
        }
    } else {
        machineObject = {id: 0, resolver: "", hostname: "", ip: 0};
    }
    //debug: console.log("Machine Object Out: " + machineObject);
    return machineObject;
}

angular.module("TokenModule", ["privacyideaAuth"])
    .factory("TokenFactory", ['AuthFactory', '$http', '$state', '$rootScope',
                              'tokenUrl', 'authUrl', 'inform', '$q',
                              function (AuthFactory, $http, $state, $rootScope,
                                        tokenUrl, authUrl, inform, $q) {
        /**
         Each service - just like this service factory - is a singleton.
         */
        var canceller = $q.defer();

        return {
            getTokensNoCancel: function (callback, params) {
                // This allows parallel token requests.
                $http.get(tokenUrl + "/", {
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()},
                    params: params
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            getTokens: function (callback, params) {
                // We only need ONE getTokens call at once.
                // If another getTokens call is running, we cancel it.
                canceller.resolve();
                canceller = $q.defer();
                $http.get(tokenUrl + "/", {
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()},
                    params: params,
                    timeout: canceller.promise
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            getTokenForSerial: function (serial, callback) {
                $http.get(tokenUrl + "/?serial=" + serial, {
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            getTokenForUser: function (params, callback) {
                $http.get(tokenUrl + "/", {
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()},
                    params: params
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            unassign: function (serial, callback) {
                $http.post(tokenUrl + "/unassign", {"serial": serial},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            disable: function (serial, callback) {
                $http.post(tokenUrl + "/disable", {"serial": serial},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            enable: function (serial, callback) {
                $http.post(tokenUrl + "/enable", {"serial": serial},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            revoke: function(serial, callback) {
                $http.post(tokenUrl + "/revoke", {"serial": serial},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            lost: function(serial, callback) {
                $http.post(tokenUrl + "/lost/" + serial, {},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            getserial: function(otp, params, callback) {
                $http.get(tokenUrl + "/getserial/" + otp, {
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()},
                    params: params
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            reset: function (serial, callback) {
                $http.post(tokenUrl + "/reset", {"serial": serial},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            setrandompin: function(serial, callback) {
                  $http.post(tokenUrl + "/setrandompin/" + serial, {},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            setpin: function(serial, key, value, callback) {
                var data = {};
                data[key] = value;
                $http.post(tokenUrl + "/setpin/" + serial, data,
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            set: function (serial, key, value, callback) {
                var data = {};
                data[key] = value;
                $http.post(tokenUrl + "/set/" + serial, data,
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            set_description: function (serial, description, callback) {
                $http.post(tokenUrl + "/description/" + serial,
                    {"description": description},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            set_dict: function (serial, params, callback) {
                $http.post(tokenUrl + "/set/" + serial, params,
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            setrealm: function (serial, realms, callback) {
                $http.post(tokenUrl + "/realm/" + serial, {realms: realms},
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            assign: function (params, callback) {
                /* if the user is in the select format
                 [ID] loginname (Givenname)
                 we need to convert it.
                 */
                $http.post(tokenUrl + "/assign", params,
                    {headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            enroll: function (userObject, formdata, callback, callback_error) {
                var username = fixUser(userObject.user);
                // all formdata is passed
                var params = formdata;
                if (formdata.generate === true) {
                    params.genkey = 1;
                    params.otpkey = null;
                }
                params.pin = userObject.pin;
                if (username) {
                    params.user = username;
                    params.realm = userObject.realm;
                }
                $http.post(tokenUrl + "/init", params,
                    {headers: {'PI-Authorization': AuthFactory.getAuthToken()}}
                ).then(function (response) { callback(response.data) },
                       function(error) { AuthFactory.authError(error.data);
                            if (callback_error) {
                                callback_error(error.data);
                            }
                });
            },
            delete: function (serial, callback) {
                $http.delete(tokenUrl + "/" + serial,
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            resync: function (params, callback) {
                $http.post(tokenUrl + "/resync", params,
                    {
                        headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                    }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            getEnrollTokens: function(callback) {
                $http.get(authUrl + "/rights",  {
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            },
            getChallenges: function(callback, serial, params) {
                $http.get(tokenUrl + "/challenges/" + serial, {
                    params: params,
                    headers: {'PI-Authorization': AuthFactory.getAuthToken()}
                }).then(function (response) { callback(response.data) }, function(error) { AuthFactory.authError(error.data) });
            }
        };
    }]);
