import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';

import rollingService from '../../api/rollingService';
import Buttons from '../../components/Buttons';
import Layouts from '../../components/Layouts';
import Modal, {
  ModalButton,
  ModalButtonWrapper,
  ModalFullButton,
  ModalTitie,
} from '../../components/Modal';
import StickyFooter from '../../components/StickyFooter';
import { isEmpty } from '../../utils';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    position: 'relative',
    minHeight: '100vh',
    flexDirection: 'column',
    background: '#FFF',
  }, 
  cardWrapper: {
    padding: '0 10px 0 10px',
  },
  card: {
    display: 'flex',
    height: '426px',
    marginTop: '35px',
    wordBreak: 'break-all',
    borderRadius: '13px',
    transition: 'all .5s ease-in-out',
    backgroundRepeat: 'no-repeat',
  },
  cardInner: {
    overflow: 'scroll',
    flex: 1,
    padding: '0 32px',
    alignItems: 'center',
    fontSize: '32px',
    lineHeight: '45px',
  },
  cardActive: {
    marginTop: 0,
    overflow: 'hidden',
    height: '426px',
    borderRadius: '13px',
    transition: 'all .5s ease-in-out',
    boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.25)',
  },
  title: {
    fontSize: '28px',
    lineHeight: '53px',
  },
  slider: {
    width: 'calc(100% + 32px)',
    marginTop: '30px',
    marginLeft: '-16px',
    alignSelf: 'normal',
  },
  sender: {
    zIndex: 10,
    marginTop: '10px',
    marginRight: '10px',
    textAlign: 'right',
    fontSize: '24px',
  },
  cardCenter: {
    textAlign: 'center',
  },
  iconWrapper: {
    display: 'block',
    background: 'transparent',
    border: 'none',
    margin: '0',
    padding: '0',
  },
  icons: {
    width: '16px',
  },
  btnWrapper: {
    fontSize: '18px',
    lineHeight: '53px',
    fontWeight: 'bold',
  },
}));
const cardStyle = (bgColor: string, bgImage: string) => {
  return {
    backgroundColor: `${bgColor}`,
    backgroundImage: `${!isEmpty(bgImage) && `url('${bgImage}')`}`,
    backgroundSize: `${!isEmpty(bgImage) && 'cover '}`,
    backgroundPosition: `${!isEmpty(bgImage) && 'center center '}`,
  };
};

interface Props {
  name: string;
  num: string;
  index: any;
}

interface CustomSlider extends Slider {
  slickNext: () => void;
  slickPrev: () => void;
}

const Detail = ({
  name, num, index,
}: Props) => {
  const classes = useStyles();
  const customSlider = useRef<CustomSlider>(null);
  const currentIndex = Number(index ?? 0);
  const [posts, setPosts] = useState({ contents: [] });
  const [sliderIndex, setSliderIndex] = useState(currentIndex + 1);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [isPostsUpdated, setIsPostsUpdated] = useState(false);
  useEffect(() => {
    const getPosts = async () => {
      await rollingService.getRollingByName(name, num).then((res) => {
        setPosts(res.data);
      });
    };
    getPosts();
    setIsPostsUpdated(false);
  }, [isPostsUpdated]);

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '30px',
    slidesToShow: 1,
    speed: 500,
    arrows: false,
    initialSlide: currentIndex,
    beforeChange: (current: any, next: number) => {
      setSliderIndex(next + 1);
    },
  };
  const gotoNext = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if(customSlider.current !== null){
      customSlider.current.slickNext();
    }
  };
  const gotoPrev = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if(customSlider.current !== null){
      customSlider.current.slickPrev();
    }
  };

  return (
    <Layouts className={ classes.root }>
      <Modal modalIsOpen={ modalIsOpen } setModalIsOpen={ setModalIsOpen }>
        <ModalTitie>
          롤링페이퍼를
          <br />
          정말 삭제하실 건가요?
        </ModalTitie>
        <ModalButtonWrapper>
          <ModalButton onClick={ () => setModalIsOpen(false) }>취소</ModalButton>
          <ModalButton
            onClick={ () => {
              deletePost(posts.contents[sliderIndex - 1].id).then((res) => {
                setModalIsOpen(false);
                if (res === 200) setSuccessModalIsOpen(true);
                setIsPostsUpdated(true);
              });
            } }
            focus
          >
            삭제
          </ModalButton>
        </ModalButtonWrapper>
      </Modal>
      <Modal
        modalIsOpen={ successModalIsOpen }
        setModalIsOpen={ setSuccessModalIsOpen }
      >
        <ModalTitie>삭제되었습니다.</ModalTitie>
        <ModalButtonWrapper>
          <ModalFullButton onClick={ () => setSuccessModalIsOpen(false) }>
            확인
          </ModalFullButton>
        </ModalButtonWrapper>
      </Modal>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 9px',
        }}
      >
        <Link
          href={{
            pathname: '/sender/main',
            query: { name: name, num: num },
          }}
        >
          <a className={ classes.iconWrapper }>
            <img
              src='/icons/back-icon-small.png'
              alt='뒤로가기'
              className={ classes.icons }
            />
          </a>
        </Link>
        <div className={ classes.title }>
          <strong>{ sliderIndex }</strong> / { posts.contents.length }
        </div>
        <button
          className={ classes.btnWrapper }
          onClick={ () => {
            setModalIsOpen(true);
          } }
        >
          삭제
        </button>
      </header>
      <Slider { ...settings } ref={ customSlider } className={ classes.slider }>
        { posts.contents.map((value:any, i:number) => {
          let letterFlag = false;
          if (value.content.length > 100) {
            letterFlag = true;
          }

          return (
            <div key={ i }>
              <div className={ classes.cardWrapper }>
                <div
                  key={ i }
                  className={ `
              ${classes.card} ${i === sliderIndex - 1 && classes.cardActive}
              ` }
                  style={ cardStyle(
                    value.backgroundColor,
                    value.backgroundImage,
                  ) }
                >
                  <p
                    className={ classes.cardInner }
                    style={{
                      color: value.color,
                      fontFamily: value.font,
                      justifyContent: value.sort,
                      display: `${!letterFlag && 'flex'}`,
                    }}
                    dangerouslySetInnerHTML={{ __html: value.content }}
                  />
                </div>
              </div>
              <div className={ classes.sender }>
                <b>From.</b>
                { value.author }
              </div>
            </div>
          );
        }) }
      </Slider>
      <StickyFooter>
        <Grid container spacing={ 2 }>
          <Grid item xs={ 6 }>
            <Buttons full light onClick={ (e: { preventDefault: () => void; }) => gotoPrev(e) }>
              이전장
            </Buttons>
          </Grid>
          <Grid item xs={ 6 }>
            <Buttons full onClick={ (e: { preventDefault: () => void; }) => gotoNext(e) }>
              다음장
            </Buttons>
          </Grid>
        </Grid>
      </StickyFooter>
    </Layouts>
  );
};

const deletePost = async (rolling_id: string) => {
  console.log(rolling_id);

  try {
    await rollingService.deleteRollingContent(rolling_id);

    return 200;
  } catch (error) {
    return 400;
  }
};

Detail.getInitialProps = async (context: { query: 
  { 
    name: string;
    num: any;
    index: number; 
  };
}) => {
  const name = context.query.name;
  const num = context.query.num;
  const index = context.query.index;
  // const res = await rollingService.getRollingByName(name, num);

  return {
    // posts: res.data,
    name: name,
    num: num,
    index: index,
  };
};

export default Detail;
