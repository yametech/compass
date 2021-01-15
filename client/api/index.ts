import {JsonApi, JsonApiErrorParsed} from "./json-api";
import {KubeJsonApi} from "./kube-json-api";
import {Notifications} from "../components/notifications";
import {clientVars} from "../../server/config";
import debounce from 'lodash/debounce';
//-- JSON HTTP APIS

export const apiBase = new JsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.BASE,
});

export const apiPermission = new JsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.TENANT,
})

export const apiTenant = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.TENANT_PREFIX.TENANT
});

export const apiIstio = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.TENANT_PREFIX.ISTIO
});

export const apiTekton = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.TEKTON,
});

export const apiKube = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.KUBE_BASE,
});
export const apiKubeUsers = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.KUBE_USERS,
});
export const apiKubeHelm = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.KUBE_HELM,
});
export const apiKubeResourceApplier = new KubeJsonApi({
    debug: !clientVars.IS_PRODUCTION,
    apiPrefix: clientVars.API_PREFIX.KUBE_RESOURCE_APPLIER,
});

const de_loginout = debounce(loginout, 800);
function loginout(){
    Notifications.error('401 Unauthorized, Please Login Again');
    if(!window.location.href.includes('login')){
        setTimeout(()=>{
            window.location.replace('/login')
        },2000)
    }
    window.localStorage.removeItem('u_config');  
}

const de_showMessage = debounce(showMessage, 800);
function showMessage(msg:string){
    Notifications.error(msg);
}

// Common handler for HTTP api errors
function onApiError(error: JsonApiErrorParsed, res: Response) {
    switch (res.status) {
        case 403:
            error.isUsedForNotification = true;
            Notifications.error(error);
            break;
        case 500:
            de_showMessage('500 Internal Server Error')
            break;   
        case 502:
            de_showMessage('502 Bad Gateway')
            break;    
        case 401:
            de_loginout()
            break; 
    }
}

apiBase.onError.addListener(onApiError);
apiKube.onError.addListener(onApiError);
apiKubeUsers.onError.addListener(onApiError);
apiKubeHelm.onError.addListener(onApiError);
apiKubeResourceApplier.onError.addListener(onApiError);
apiTenant.onError.addListener(onApiError);
apiPermission.onError.addListener(onApiError);