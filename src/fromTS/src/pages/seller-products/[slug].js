import { Container, Typography } from '@material-ui/core';
import { getFirst, isValid, SellerClient } from 'clients';
import Template from 'components/layout/Template';
import SellerProductListing from 'components/organisms/SellerProductListing';
import { PAGE_SIZE_30 } from 'constants/data';
import { useSetting } from 'context';
import useTrackingTimeout from 'hooks/useTrackingTimeout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { doWithServerSide, ProductServiceV2 } from 'services';
import { FormatNumber } from 'utils';
import useMobileV2 from 'zustand-lib/storeMobile';
import useGetTagPromotion from 'zustand-lib/useGetTagPromotion';

export async function getServerSideProps(ctx) {
  return doWithServerSide(
    ctx,
    async () => {
      const { query } = ctx;
      const { slug, currentTab = '', sort = '' } = query;
      const page = Number(ctx.query.page) || 1;
      const sellerRes = await SellerClient.getSellerInfo({ ctx, slug });
      if (!isValid(sellerRes)) {
        return {
          redirect: {
            destination: '/',
          },
        };
      }
      const sellerInfo = getFirst(sellerRes);
      const { code: sellerCode, name } = sellerInfo;
      const [listProduct, tabs] = await Promise.all([
        ProductServiceV2.loadProductWithSeller({
          ctx,
          code: sellerCode,
          offset: (page - 1) * PAGE_SIZE_30,
        }),
        ProductServiceV2.getListTabs({ ctx }),
      ]);

      const { data = [], total = 0 } = listProduct;
      return {
        props: {
          name,
          products: data,
          total,
          currentTab,
          page,
          sort,
          tabs,
          slug,
          sellerInfo,
        },
      };
    },
    {
      serverSideTranslations,
      namespaces: ['common'],
    },
  );
}

const ListProduct = ({ name, isMobile, products, total, tabs = [], currentTab = '', page = '', sort = '', isAuthenticated, slug, sellerInfo }) => {
  const { getNameSeller } = useSetting();
  const isMobileV2 = useMobileV2((state) => state.isMobileV2());
  const sellerObject = getNameSeller({ seller: sellerInfo });
  const sellerName = sellerObject?.fullNameSeller || name;
  const sellerTitle = `Danh sách sản phẩm của ${sellerName}`;
  const title = isMobileV2 ? 'Thông tin cửa hàng' : 'Danh sách sản phẩm của nhà bán hàng';
  const pathName = `seller-products/${slug}`;

  // Tracking timing GA
  useTrackingTimeout('Sellers');

  // Scroll tracking GA
  // useScrollTracking('Sellers');

  const getPromoLists = useGetTagPromotion((state) => state.getPromoLists);
  useEffect(() => {
    const dataSku = [];
    products?.forEach((item) => dataSku.push(item?.sku));
    const controller = new AbortController();
    const { signal } = controller;
    getPromoLists({ skus: [...dataSku], getVoucherInfo: false, signal });

    return () => controller.abort();
  }, [products]);

  return (
    <Template title={title} isMobile={isMobile} pageTitle={title}>
      <Container maxWidth="lg">
        <Typography
          className="product_title"
          variant="h5"
          component="h5"
          style={{ fontWeight: 'bold', marginTop: isMobileV2 ? 0 : 50, textAlign: 'center' }}
        >
          {sellerTitle}
        </Typography>
        <Typography>Hiển thị {FormatNumber.formatNumber(total)} sản phẩm</Typography>
        <SellerProductListing
          products={products}
          total={total}
          currentTab={currentTab}
          page={page}
          sort={sort}
          catName={pathName}
          tabs={tabs}
          isAuthenticated={isAuthenticated}
          isMobile={isMobile}
          isMobileV2={isMobileV2}
        />
      </Container>
    </Template>
  );
};
export default ListProduct;
