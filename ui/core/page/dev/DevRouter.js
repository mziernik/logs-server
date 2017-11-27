import Endpoint from "../../application/Endpoint";
import {DEBUG_MODE} from "../../Dev";


export default class DevRouter extends Endpoint {

    static INSTANCES: DevRouter[] = [];

    // DEMO: Endpoint;
    // SKIN: Endpoint;
    // EVENTS: Endpoint;
    // PERMISSIONS: Endpoint;
    // REPOS: Endpoint;
    // JS_TESTER: Endpoint;
    // COMPONENTS: Endpoint;
    // LOCAL_STORAGE: Endpoint;
    // MODULES: Endpoint;
    // CTX_OBJS: Endpoint;
    // ICONS: Endpoint;
    // WEBAPI: Endpoint;
    //
    // REPO: Endpoint;
    // REPO_DETAILS: Endpoint;
    // RECORD: Endpoint;
    // CONFIG: Endpoint;

    constructor(baseUrl: string) {
        super("dev", "#dev", baseUrl, null);

        if (!DEBUG_MODE)
            this.hidden();

        /*      this.REPOS = this.child("repos", "Repozytoria", baseUrl + "/repositories", PRepositories);
              this.REPO = this.REPOS.child("repo", "Repozytorium", this.REPOS._path + "/:repo", PRepository).hidden(true);
              this.REPO_DETAILS = this.REPOS.child("repodetails", "Szczegóły", this.REPOS._path + "/:repo/details", PRepoDetails).hidden(true);


              const service = this.child("service", "Usługa", baseUrl + "/svr/");
              this.EVENTS = service.child("events", "Zdarzenia", baseUrl + "/svr/events", PEvents);
              this.COMPONENTS = service.child("components", "Komponenty", baseUrl + "/svr/components", PComponents);
              this.CTX_OBJS = service.child("ctxObjs", "Obiekty kontekstu", baseUrl + "/svr/ctxobj", PContextObject);
              this.MODULES = service.child("modules", "Moduły", baseUrl + "/svr/modules", PModules);


              const tools = this.child("tools", "Narzędzia", baseUrl + "/tools");
              this.DEMO = tools.child("demo", "Demo", service._path + "/demo", Demo);
              this.JS_TESTER = tools.child("webTester", "WEB Tester", service._path + "/webtest", PWebTester);
              this.WEBAPI = tools.child("webapi", "WebApi", service._path + "/webapi", PWebApi);
              this.LOCAL_STORAGE = tools.child("localStorage", "Magazyn lokalny", service._path + "/localstorage", PLocalStorage);
              this.ICONS = tools.child("icons", "Ikony", service._path + "/icons", PIcons);
              tools.child("unicode", "Unicode", service._path + "/unicode", PUnicode);


              const config = this.child("cfg", "Konfiguracja", baseUrl + "/cfg");
              this.CONFIG = config.child("config", "Konfiguracja", config._path + "/config", PConfig);
              this.SKIN = config.child("skin", "Skórka", config._path + "/skin", PSkin);
              this.PERMISSIONS = config.child("perms", "Uprawnienia", config._path + "/permissions", PPermissions);

              this.RECORD = this.REPOS.child("rec", "Rekord", this.REPOS._path + "/:repo/edit/:id", PRecord)
                  .defaultParams({
                      repo: "permissions",
                      rec: null
                  }).hidden(true);

              this.REPOS.REPO = this.REPO;
              this.REPO.RECORD = this.RECORD;
              this.REPO.REPO_DETAILS = this.REPO_DETAILS;

              DevRouter.INSTANCES.push(this);

              Object.preventExtensions(this);

              Dev.TOOLS.push(MenuItem.create((mi: MenuItem) => {
                  mi.name = "Demo";
                  mi.onClick = e => this.DEMO.navigate(null, e);
              }));

              Dev.TOOLS.push(MenuItem.create((mi: MenuItem) => {
                  mi.name = "Konfiguracja";
                  mi.onClick = e => this.CONFIG.navigate(null, "popup");
              }));

              const repoMenuItem: MenuItem = MenuItem.create((mi: MenuItem) => {
                  mi.name = "Repozytoria";
              });

              Dev.TOOLS.push(repoMenuItem);

              AppEvent.REPOSITORY_REGISTERED.listen(this, data => {
                      const repo: Repository = data.repository;
                      const group = repo.config.group;
                      let parent: Endpoint = this.REPOS;
                      if (group) {
                          let key = Utils.formatId(group).toLowerCase();
                          parent = this.REPOS._children.find((e: Endpoint) => e.key.endsWith("." + key));
                          if (!parent)
                              parent = this.REPOS.child(key, group, null, null);
                      }

                      let miGroup = group ? Utils.find(repoMenuItem.subMenu, (mi: MenuItem) => mi.name === group) : repoMenuItem;
                      if (!miGroup) miGroup = repoMenuItem.item((mi: MenuItem) => {
                          mi.name = group;
                      });

                      parent.child(repo.key.replaceChars(".-", ""), repo.name, this.REPOS._path + "/" + repo.key, PRepository)
                          .icon(repo.config.icon);
                      parent.sortChildren();

                      miGroup.item((mi: MenuItem) => {
                          mi.name = repo.name;
                      });

                  }
              );
      */
    }

}

//----------------------------------------------- DEWELOPERSKIE --------------------------------------------------------
