import "./item-list-layout.scss"
import groupBy from "lodash/groupBy"

import React, { ReactNode } from "react";
import { computed, observable, reaction, toJS, when } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Plural, Trans } from "@lingui/macro";
import { ConfirmDialog, IConfirmDialogParams } from "../confirm-dialog";
import { SortingCallback, Table, TableCell, TableCellProps, TableHead, TableProps, TableRow, TableRowProps } from "../table";
import { autobind, createStorage, cssNames, IClassName, isReactNode, noop, prevDefault, stopPropagation } from "../../utils";
import { AddRemoveButtons, AddRemoveButtonsProps } from "../add-remove-buttons";
import { Icon } from "../icon";
import { NoItems } from "../no-items";
import { Spinner } from "../spinner";
import { ItemObject, ItemStore } from "../../item.store";
import { SearchInput } from "../input";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Filter, FilterType, pageFilters } from "./page-filters.store";
import { PageFiltersList } from "./page-filters-list";
import { PageFiltersSelect } from "./page-filters-select";
import { PageFiltersTag } from "./page-filters-tag";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select";
import { themeStore } from "../../theme.store";
import Tooltip from "@material-ui/core/Tooltip";

// todo: refactor, split to small re-usable components

export type SearchFilter<T extends ItemObject = any> = (item: T) => string | number | (string | number)[];
export type ItemsFilter<T extends ItemObject = any> = (items: T[]) => T[];
export type searchRegexpFilter<T extends ItemObject = any> = {
  prefix: string,
  cb: (item: T) => string | number | (string | number)[]
};

interface IHeaderPlaceholders {
  title: ReactNode;
  search: ReactNode;
  filters: ReactNode;
  info: ReactNode;
  filterTags: ReactNode;
}

export interface ItemListLayoutProps<T extends ItemObject = ItemObject> {
  className: IClassName;
  store: ItemStore<T>;
  dependentStores?: ItemStore[];
  isClusterScoped?: boolean;
  isShowTag?: boolean;
  hideFilters?: boolean;
  searchFilters?: SearchFilter<T>[];
  searchRegexpFilters?: searchRegexpFilter<T>[];
  filterItems?: ItemsFilter<T>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?: ReactNode | ((parent: ItemListLayout) => ReactNode);
  customizeHeader?: (placeholders: IHeaderPlaceholders, content: ReactNode) => Partial<IHeaderPlaceholders> | ReactNode;

  // items list configuration
  isReady?: boolean; // show loading indicator while not ready
  isSelectable?: boolean; // show checkbox in rows for selecting items
  isSearchable?: boolean; // apply search-filter & add search-input
  copyClassNameFromHeadCells?: boolean;
  sortingCallbacks?: { [sortBy: string]: SortingCallback };
  tableProps?: Partial<TableProps>; // low-level table configuration
  renderTableHeader: TableCellProps[] | null;
  renderTableContents: (item: T) => (ReactNode | TableCellProps)[];
  renderItemMenu?: (item: T, store: ItemStore<T>) => ReactNode;
  customizeTableRowProps?: (item: T) => Partial<TableRowProps>;
  addRemoveButtons?: Partial<AddRemoveButtonsProps>;
  virtual?: boolean;

  // item details view
  hasDetailsView?: boolean;
  detailsItem?: T;
  onDetails?: (item: T) => void;

  // other
  customizeRemoveDialog?: (selectedItems: T[]) => Partial<IConfirmDialogParams>;
  renderFooter?: (parent: ItemListLayout) => React.ReactNode;

}

const defaultProps: Partial<ItemListLayoutProps> = {
  showHeader: true,
  isSearchable: true,
  isSelectable: true,
  copyClassNameFromHeadCells: true,
  dependentStores: [],
  filterItems: [],
  hasDetailsView: true,
  onDetails: noop,
  virtual: true
};

interface ItemListLayoutUserSettings {
  showAppliedFilters?: boolean;
}

@observer
export class ItemListLayout extends React.Component<ItemListLayoutProps> {
  static defaultProps = defaultProps as object;

  @observable isUnmounting = false;

  // default user settings (ui show-hide tweaks mostly)
  @observable userSettings: ItemListLayoutUserSettings = {
    showAppliedFilters: true,
  };

  constructor(props: ItemListLayoutProps) {
    super(props);

    // keep ui user settings in local storage
    const defaultUserSettings = toJS(this.userSettings);
    const storage = createStorage<ItemListLayoutUserSettings>("items_list_layout", defaultUserSettings);
    Object.assign(this.userSettings, storage.get()); // restore
    disposeOnUnmount(this, [
      reaction(() => toJS(this.userSettings), settings => storage.set(settings)),
    ]);
  }

  async componentDidMount() {
    const { store, dependentStores, isClusterScoped } = this.props;
    const stores = [store, ...dependentStores];
    if (!isClusterScoped) stores.push(namespaceStore);
    
    const loadingStores = stores.filter(store => !store.isLoaded);
    loadingStores.forEach(store => store.loadAll());
    
    await when(() => loadingStores.every(store => !store.isLoading));
    const subscriptions = stores.map(store => store.subscribe());
    await when(() => this.isUnmounting);
    subscriptions.forEach(dispose => dispose()); // unsubscribe all
  }

  componentWillUnmount() {
    this.isUnmounting = true;
    const { store, isSelectable } = this.props;
    if (isSelectable) store.resetSelection();
  }

  private filterCallbacks: { [type: string]: ItemsFilter } = {
    [FilterType.SEARCH]: items => {
      const { searchFilters, searchRegexpFilters, isSearchable } = this.props;
      const search = pageFilters.getValues(FilterType.SEARCH)[0] || "";
      if (search && isSearchable && searchFilters) {
        const normalizeText = (text: string) => String(text).toLowerCase();
        const searchTexts = [search].map(normalizeText)[0];
        const hasRegexp = searchRegexpFilters && searchRegexpFilters.some(regex => {
          try {
            new RegExp(searchTexts.substring(regex.prefix.length - 1));
            return new RegExp(regex.prefix.toLowerCase()).test(searchTexts)
          }  catch (err) {
            console.log('Error RegExp', err)
            return false
          }
        })
        return items.filter(item => {
          if (searchRegexpFilters && hasRegexp) {
            return searchRegexpFilters.some(getTexts => {
              const sourceTexts: string[] = [getTexts.cb(item)].flat().map(normalizeText);
              console.log('sourceTexts', sourceTexts);
              return sourceTexts.some(source => new RegExp(searchTexts.substring(getTexts.prefix.length - 1)).test(source));
            })
          }
          return searchFilters.some(getTexts => {
            const sourceTexts: string[] = [getTexts(item)].flat().map(normalizeText);
            return sourceTexts.some(source => source.includes(searchTexts));
          })
        });
      }
      return items;
    },

    [FilterType.NAMESPACE]: items => {
      const filterValues = pageFilters.getValues(FilterType.NAMESPACE);
      if (filterValues.length > 0) {
        return items.filter(item => filterValues.includes(item.getNs()))
      }
      return items;
    },

    [FilterType.TAGNAME]: items => {
      const { isShowTag } = this.props;
      const tagValues = pageFilters.getValues(FilterType.TAGNAME)[0] || "";
      if (tagValues && isShowTag) {
        return items.filter(item => item.metadata?.labels?.tagName === tagValues)
      }
      return items;
    },
  }

  @computed get isReady() {
    const { isReady, store } = this.props;
    return typeof isReady == "boolean" ? isReady : store.isLoaded;
  }

  @computed get filters() {
    let { activeFilters } = pageFilters;
    const { isClusterScoped, isSearchable, searchFilters, isShowTag } = this.props;
    if (isClusterScoped) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.NAMESPACE);
    }
    if (!(isSearchable && searchFilters)) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.SEARCH);
    }
    if (!isShowTag) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.TAGNAME);
    }
    return activeFilters;
  }

  applyFilters<T>(filters: ItemsFilter[], items: T[]): T[] {
    if (!filters || !filters.length) return items;
    return filters.reduce((items, filter) => filter(items), items);
  }

  @computed get allItems() {
    const { filterItems, store } = this.props;
    return this.applyFilters(filterItems, store.items);
  }

  @computed get items() {
    const { allItems, filters, filterCallbacks } = this;
    const filterItems: ItemsFilter[] = [];
    const filterGroups = groupBy<Filter>(filters, ({ type }) => type);
    
    Object.entries(filterGroups).forEach(([type, filtersGroup]) => {
      const filterCallback = filterCallbacks[type];
      if (filterCallback && filtersGroup.length > 0) {
        filterItems.push(filterCallback);
      }
    });
    
    return this.applyFilters(filterItems, allItems);
  }

  @autobind()
  getRow(uid: string) {
    const {
      isSelectable, renderTableHeader, renderTableContents, renderItemMenu,
      store, hasDetailsView, onDetails,
      copyClassNameFromHeadCells, customizeTableRowProps, detailsItem,
    } = this.props;
    const { isSelected } = store;
    const item = this.items.find(item => item.getId() == uid);
    if (!item) return;
    const itemId = item.getId();
    return (
      <TableRow
        key={itemId}
        nowrap
        searchItem={item}
        sortItem={item}
        selected={detailsItem && detailsItem.getId() === itemId}
        onClick={hasDetailsView ? prevDefault(() => onDetails(item)) : undefined}
        {...(customizeTableRowProps ? customizeTableRowProps(item) : {})}
      >
        {isSelectable && (
          <TableCell
            checkbox
            isChecked={isSelected(item)}
            onClick={prevDefault(() => store.toggleSelection(item))}
          />
        )}
        {
          renderTableContents(item)
            .map((content, index) => {
              const cellProps: TableCellProps = isReactNode(content) ? { children: content } : content;
              if (copyClassNameFromHeadCells && renderTableHeader) {
                const headCell = renderTableHeader[index];
                if (headCell) {
                  cellProps.className = cssNames(cellProps.className, headCell.className);
                }
              }
              return <TableCell key={index} {...cellProps}/>
            })
        }
        {renderItemMenu && (
          <TableCell className="menu" onClick={stopPropagation}>
            {renderItemMenu(item, store)}
          </TableCell>
        )}
      </TableRow>
    );
  }

  @autobind()
  removeItemsDialog() {
    const { customizeRemoveDialog, store } = this.props;
    const { selectedItems, removeSelectedItems } = store;
    const visibleMaxNamesCount = 5;
    const selectedNames = selectedItems.map(ns => ns.getName()).slice(0, visibleMaxNamesCount).join(", ");
    const dialogCustomProps = customizeRemoveDialog ? customizeRemoveDialog(selectedItems) : {};
    const selectedCount = selectedItems.length;
    const tailCount = selectedCount > visibleMaxNamesCount ? selectedCount - visibleMaxNamesCount : 0;
    const tail = tailCount > 0 ? <Trans>and <b>{tailCount}</b> more</Trans> : null;
    ConfirmDialog.open({
      ok: removeSelectedItems,
      labelOk: <Trans>Remove</Trans>,
      message: (
        <Plural
          value={selectedCount}
          one={<p>Remove item <b>{selectedNames}</b>?</p>}
          other={<p>Remove <b>{selectedCount}</b> items <b>{selectedNames}</b> {tail}?</p>}
        />
      ),
      ...dialogCustomProps,
    })
  }

  renderFilters() {
    const { hideFilters } = this.props;
    const { isReady, userSettings, filters } = this;
    if (!isReady || !filters.length || hideFilters || !userSettings.showAppliedFilters) {
      return;
    }
    return <PageFiltersList filters={filters}/>
  }

  renderNoItems() {
    const { allItems, items, filters } = this;
    const allItemsCount = allItems.length;
    const itemsCount = items.length;
    const isFiltered = filters.length > 0 && allItemsCount > itemsCount;
    if (isFiltered) {
      return (
        <NoItems>
          <Trans>No items found.</Trans>
          <p>
            <a onClick={() => pageFilters.reset()} className="contrast">
              <Trans>Reset filters?</Trans>
            </a>
          </p>
        </NoItems>
      )
    }
    return <NoItems/>
  }

  renderHeaderContent(placeholders: IHeaderPlaceholders): ReactNode {
    const { title, filters, search, info, filterTags } = placeholders;
    return (
      <>
        {title}
        <div className="info-panel box grow">
          {this.isReady && info}
        </div>
        {filterTags}
        {filters}
        {search}
      </>
    )
  }

  renderInfo() {
    const { allItems, items, isReady, userSettings, filters } = this;
    const allItemsCount = allItems.length;
    const itemsCount = items.length;
    const isFiltered = isReady && filters.length > 0;
    if (isFiltered) {
      const toggleFilters = () => userSettings.showAppliedFilters = !userSettings.showAppliedFilters;
      return (
        <Trans>
          <a onClick={toggleFilters}>Filtered</a>: {itemsCount} / {allItemsCount}
        </Trans>
      )
    }
    return (
      <Plural
        value={allItemsCount}
        one="# item"
        other="# items"
      />
    );
  }

  renderHeader() {
    const { showHeader, customizeHeader, renderHeaderTitle, headerClassName, isClusterScoped, isShowTag, searchRegexpFilters } = this.props;
    if (!showHeader) return;
    const title = typeof renderHeaderTitle === "function" ? renderHeaderTitle(this) : renderHeaderTitle;
    let searchTips = null;
    if (searchRegexpFilters) {
      let field = searchRegexpFilters.map(item => item.prefix.replace('^', '')).join(',');
      searchTips = (
        <Tooltip arrow title={`you can search ${field.replace(':', '')} by regexp expression, such as Input ${field} {regexp}`}>
          <Icon
            small
            material="info"
            style={{ marginLeft: -10, color: '#ff9900', cursor: 'pointer' }}
          />
        </Tooltip>
      )
    }
    const placeholders: IHeaderPlaceholders = {
      title: <h5 className="title">{title}</h5>,
      info: this.renderInfo(),
      filterTags: <>{isShowTag && <PageFiltersTag />}</>,
      filters: <>
        {!isClusterScoped && <NamespaceSelectFilter />}
        <PageFiltersSelect allowEmpty disableFilters={{
          [FilterType.NAMESPACE]: true, // namespace-select used instead
        }}/>
      </>,
      search: <><SearchInput/>{searchTips}</>,
    }
    let header = this.renderHeaderContent(placeholders);
    if (customizeHeader) {
      const modifiedHeader = customizeHeader(placeholders, header);
      if (isReactNode(modifiedHeader)) {
        header = modifiedHeader;
      }
      else {
        header = this.renderHeaderContent({
          ...placeholders,
          ...modifiedHeader as IHeaderPlaceholders,
        });
      }
    }
    return (
      <div className={cssNames("header flex gaps align-center", headerClassName)}>
        {header}
      </div>
    )
  }

  renderList() {
    const {
      isSelectable, tableProps = {}, renderTableHeader, renderItemMenu,
      store, hasDetailsView, addRemoveButtons = {}, virtual, sortingCallbacks, detailsItem
    } = this.props;
    const { isReady, removeItemsDialog, items } = this;
    const { selectedItems } = store;
    const selectedItemId = detailsItem && detailsItem.getId();
    return (
      <div className="items box grow flex column">
        {!isReady && (
          <Spinner center/>
        )}
        {isReady && (
          <Table
            virtual={virtual}
            selectable={hasDetailsView}
            sortable={sortingCallbacks}
            getTableRow={this.getRow}
            items={items}
            selectedItemId={selectedItemId}
            noItems={this.renderNoItems()}
            {...({
              ...tableProps,
              className: cssNames("box grow", tableProps.className, themeStore.activeTheme.type),
            })}
          >
            {renderTableHeader && (
              <TableHead showTopLine nowrap>
                {isSelectable && (
                  <TableCell
                    checkbox
                    isChecked={store.isSelectedAll(items)}
                    onClick={prevDefault(() => store.toggleSelectionAll(items))}
                  />
                )}
                {renderTableHeader.map((cellProps, index) => <TableCell key={index} {...cellProps}/>)}
                {renderItemMenu && <TableCell className="menu"/>}
              </TableHead>
            )}
            {
              !virtual && items.map(item => this.getRow(item.getId()))
            }
          </Table>
        )}
        <AddRemoveButtons
          onRemove={selectedItems.length ? removeItemsDialog : null}
          removeTooltip={<Trans>Remove selected items ({selectedItems.length})</Trans>}
          {...addRemoveButtons}
        />
      </div>
    )
  }

  renderFooter() {
    if (this.props.renderFooter) {
      return this.props.renderFooter(this);
    }
  }

  render() {
    const { className } = this.props;
    return (
      <div className={cssNames("ItemListLayout flex column", className)}>
        {this.renderHeader()}
        {this.renderFilters()}
        {this.renderList()}
        {this.renderFooter()}
      </div>
    );
  }
}
