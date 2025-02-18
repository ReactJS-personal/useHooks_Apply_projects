import { Button, Collapse, Container, Grid, Paper, Typography } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SliderMobile from 'components-v2/mocules/mobile/SliderMobile/Banner';
import CustomerSellerCardV2 from 'components/mocules/CustomerSellerCardV2';
import CustomSlider from 'components/organisms/CustomSlider';
import { settingsCustomerSeller } from 'constants/data';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import styles from './styles.module.css';

const ReactPlayerDynamic = dynamic(() => import('react-player'), { ssr: false });

const MV2LandingPageSeller = ({ banners = [], videoIntroduces = '', description = '', feedbacks = [], thumbnail = '', isMobileV2 = false }) => {
  const [seeMore, setSeeMore] = useState(false);
  const [height, setHeight] = useState(0);
  const [mobileBannerSlider, setMobileBannerSlider] = useState([]);
  const [mobileContentBanner, setContentBanner] = useState([]);
  const ref = useRef(null);

  const bannerSlider = banners?.filter((item) => item?.type === 'SLIDER') || [];
  const contentBanner = banners?.filter((item) => item?.type === 'BANNER_CONTENT') || [];

  useEffect(() => {
    if (banners && banners.length > 0) {
      const formatBannerSlider = bannerSlider?.map((obj) => ({
        url: obj.images[0],
        alt: obj.name,
        target: obj.link,
      }));
      const formatContentBanner = contentBanner?.map((obj) => ({
        url: obj.images[0],
        alt: obj.name,
        target: obj.link,
      }));
      setMobileBannerSlider(formatBannerSlider);
      setContentBanner(formatContentBanner);
    }
  }, [banners]);
  useEffect(() => {
    setHeight(ref?.current?.clientHeight || 0);
  });
  return (
    <div className={styles.homeContainer}>
      <Grid style={{ padding: mobileBannerSlider.length > 0 && '0px 15px 20px' }} container>
        {banners.length > 0 && mobileBannerSlider.length > 0 && (
          <Grid item xs={12} lg={12}>
            <SliderMobile banners={mobileBannerSlider} />
          </Grid>
        )}
      </Grid>
      {description && (
        <div className={styles.descriptionWrapper}>
          <Collapse in={seeMore} collapsedSize="85px">
            <Paper ref={ref} className={styles.generalInfo}>
              <Typography className={styles.titleIntro}>Giới thiệu chung</Typography>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            </Paper>
          </Collapse>
          <div className={styles.warpperBtnCollapse}>
            {height > 120 && (
              <Button className={styles.btnCollapse} endIcon={seeMore ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={() => setSeeMore(!seeMore)}>
                {seeMore ? 'Ẩn' : 'Xem thêm'}
              </Button>
            )}
          </div>
        </div>
      )}
      <Grid style={{ padding: mobileContentBanner.length > 0 && '20px 15px 0px' }} container>
        {banners.length > 0 && mobileContentBanner.length > 0 && (
          <Grid item xs={12} lg={12}>
            <SliderMobile banners={mobileContentBanner} />
          </Grid>
        )}
      </Grid>
      {videoIntroduces[0] && (
        <ReactPlayerDynamic
          url={videoIntroduces}
          controls
          width="100%"
          height={480}
          className={styles.video}
          style={{ backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      {feedbacks?.length > 0 && (
        <Paper className={styles.customer}>
          <Container style={{ padding: '20px 15px' }}>
            <Typography className={styles.titleCustomer}>Khách hàng nói gì về chúng tôi</Typography>
            <CustomSlider
              className={styles.slider}
              config={{
                ...settingsCustomerSeller,
                arrows: false,
                infinite: true,
                dots: true,
                dotsClass: 'banner-slider-dots',
                appendDots: (dots) => <div>{dots}</div>,
              }}
            >
              {feedbacks?.map((item) => (
                <CustomerSellerCardV2 key={item?.code} info={item} isMobileV2={isMobileV2} />
              ))}
            </CustomSlider>
          </Container>
        </Paper>
      )}
    </div>
  );
};

export default MV2LandingPageSeller;
